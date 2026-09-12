import io
p = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\app\js\modules\coil.js"
c = io.open(p, encoding="utf-8").read()
if "data/pipes.js" not in c:
    c = c.replace("import { psychroChartSVG } from '../charts.js';",
                  "import { psychroChartSVG } from '../charts.js';\nimport { STEEL_PIPES } from '../data/pipes.js';")
    io.open(p, "w", encoding="utf-8").write(c)
print("STEEL_PIPES import:", "data/pipes.js" in c)
