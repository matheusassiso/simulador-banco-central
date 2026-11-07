"""Exporta o FRB/US (pyfrbus, Federal Reserve, domínio público) para dois arquivos JavaScript compactos:
   frbus-model.js (equações da versão com expectativas VAR e coeficientes) e frbus-data.js (janela 2036Q1-2046Q4 do cenário base).
Uso (ambiente isolado):  venv-pyfrbus\\Scripts\\python.exe -I tools\\frbus_export.py <model.xml> <LONGBASE.TXT> <pasta de saída>
"""
import json, re, sys
import xml.etree.ElementTree as ET
import pandas

xml_path, data_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
root = ET.parse(xml_path).getroot()

coeffs, endo, exo, eqs = {}, [], [], {}
for v in root.findall('variable'):
    name = v.find('name').text.lower()
    kind = v.find('equation_type').text
    if kind == 'Exogenous':
        exo.append(name)
    else:
        e = v.find('standard_equation')
        pe = e.find('python_equation') if e is not None else None
        if pe is None or not pe.text:
            raise SystemExit('sem equação padrão: ' + name)
        endo.append(name)
        eqs[name] = re.sub(r'\s+', ' ', pe.text.strip())
        for c in e.findall('coeff'):
            cname = c.find('cf_name').text.strip().lower()
            cname = re.sub(r'\((\d+)\)', r'_\1', cname)  # y_x(1) -> y_x_1
            coeffs[cname] = float(c.find('cf_value').text)

data = pandas.read_csv(data_path, index_col=0)
data.index = pandas.PeriodIndex(data.index, freq='Q')
data.columns = [c.lower() for c in data.columns]
win = data.loc[pandas.Period('2036Q1'):pandas.Period('2046Q4')]
cols = [c for c in (endo + exo) if c in win.columns]
missing = [c for c in endo + exo if c not in win.columns]
series = {c: [None if pandas.isna(x) else float(x) for x in win[c].values] for c in cols}

def dump(var, obj, path):
    s = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    js = ("/* Gerado por tools/frbus_export.py a partir do pyfrbus 1.1.1 (Federal Reserve, domínio público). Não edite à mão. */\n"
          "(function(r){var d=" + s + ";if(typeof module!=='undefined'&&module.exports)module.exports=d;else r." + var + "=d;})(typeof window!=='undefined'?window:globalThis);\n")
    with open(path, 'w', encoding='utf-8') as f: f.write(js)

dump('FRBUS_MODEL', {'endo': endo, 'exo': exo, 'eq': eqs, 'coef': coeffs}, out_dir + '/frbus-model.js')
dump('FRBUS_DATA', {'start': '2036Q1', 'n': len(win), 'series': series}, out_dir + '/frbus-data.js')
print('endógenas', len(endo), 'exógenas', len(exo), 'coeficientes', len(coeffs), 'trimestres', len(win), 'séries', len(series), 'sem dado:', missing[:10])
