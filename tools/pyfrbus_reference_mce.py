"""Referência do FRB/US com expectativas racionais (MCE, grupos mcap+wp) a partir do pyfrbus (Federal Reserve, domínio público).
Cenário do demo example2.py (juros +100 pb em 2040Q1, meta de superávit, r* endógeno depois de 39 trimestres), com horizonte de 80 trimestres.
Uso: venv-pyfrbus\\Scripts\\python.exe -I tools\\pyfrbus_reference_mce.py <pasta com pyfrbus> <pasta com LONGBASE.TXT> <saida.json>"""
import json, sys, time
pkg_dir, data_dir, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, pkg_dir)
import pandas  # noqa: E402
from pyfrbus.frbus import Frbus  # noqa: E402
from pyfrbus.load_data import load_data  # noqa: E402

data = load_data(data_dir + "/LONGBASE.TXT")
frbus = Frbus(pkg_dir + "/models/model.xml", mce="mcap+wp")
start = pandas.Period("2040Q1"); N = 80; end = start + (N - 1)
data.loc[start:end, "dfpdbt"] = 0
data.loc[start:end, "dfpsrp"] = 1
data.loc[start:end, "drstar"] = 0
data.loc[(start + 39):end, "drstar"] = 1
t0 = time.time()
base = frbus.init_trac(start, end, data)
shocked = base.copy(); shocked.loc[start, "rffintay_aerr"] += 1
sim = frbus.solve(start, end, shocked)
want = ["rff", "rg10", "lur", "xgap2", "picxfe", "pcpi", "xgdp", "ebfi", "ecnia", "rme"]
per = pandas.period_range(start, end)
out = {"fonte": "pyfrbus 1.1.1, mce=mcap+wp", "cenario": "juros +100 pb em 2040Q1; dfpdbt=0, dfpsrp=1; drstar=0 por 39 trimestres e depois 1; horizonte de 80 trimestres",
       "trimestres": N, "variaveis": want, "desvio": {c: [float(sim.loc[p, c] - base.loc[p, c]) for p in per] for c in want}}
json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False)
print("ok em %.1f s" % (time.time() - t0)); print("rff:", [round(x, 3) for x in out["desvio"]["rff"][:6]]); print("lur 8:", round(out["desvio"]["lur"][7], 3), "picxfe 8:", round(out["desvio"]["picxfe"][7], 3))
