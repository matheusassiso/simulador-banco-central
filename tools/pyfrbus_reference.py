"""Gera resultados de referencia do FRB/US (pyfrbus, Federal Reserve, dominio publico).

Reproduz o cenario do demo `example1.py` do Fed: choque de +100 pb no juro (rffintay_aerr) com meta de superavit.
Uso (ambiente isolado, sem tocar no Python do sistema):
    venv-pyfrbus\\Scripts\\python.exe -I tools\\pyfrbus_reference.py <pasta com pyfrbus> <pasta com LONGBASE.TXT> <saida.json>
"""
import json
import sys

pkg_dir, data_dir, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, pkg_dir)  # -I desliga o cwd e PYTHONPATH; o pacote entra de forma explicita

import pandas  # noqa: E402
from pyfrbus.frbus import Frbus  # noqa: E402
from pyfrbus.load_data import load_data  # noqa: E402

data = load_data(data_dir + "/LONGBASE.TXT")
frbus = Frbus(pkg_dir + "/models/model.xml")

start = pandas.Period("2040Q1")
end = start + 23

# configuracao padrao do demo: meta de razao de superavit
data.loc[start:end, "dfpdbt"] = 0
data.loc[start:end, "dfpsrp"] = 1

baseline = frbus.init_trac(start, end, data)          # trajetoria base (resolve com "adds")
shocked = baseline.copy()
shocked.loc[start, "rffintay_aerr"] += 1              # +100 pb no juro, no primeiro trimestre
sim = frbus.solve(start, end, shocked)

want = ["rff", "rg10", "lur", "xgap2", "picxfe", "pcpi", "xgdp", "ebfi", "ecnia", "rme"]
cols = [c for c in want if c in sim.columns]
period = pandas.period_range(start, end)
out = {
    "fonte": "pyfrbus 1.1.1 (Federal Reserve, dominio publico), model.xml stdver, expectativas VAR (padrao do demo)",
    "cenario": "choque de +100 pb em rffintay_aerr em 2040Q1; superavit-alvo (dfpsrp=1, dfpdbt=0)",
    "inicio": str(start), "trimestres": len(period), "variaveis": cols,
    "base": {c: [float(baseline.loc[p, c]) for p in period] for c in cols},
    "choque": {c: [float(sim.loc[p, c]) for p in period] for c in cols},
}
out["desvio"] = {c: [b - a for a, b in zip(out["base"][c], out["choque"][c])] for c in cols}
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
print("ok:", cols)
print("rff desvio (4 primeiros trimestres):", [round(x, 3) for x in out["desvio"]["rff"][:4]] if "rff" in cols else "-")
if "lur" in cols:
    print("lur desvio (trimestres 1, 4, 8, 12):", [round(out["desvio"]["lur"][i], 3) for i in (0, 3, 7, 11)])
if "picxfe" in cols:
    print("picxfe desvio (trimestres 1, 4, 8, 12):", [round(out["desvio"]["picxfe"][i], 3) for i in (0, 3, 7, 11)])
