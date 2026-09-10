import io
p = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\app\sw.js"
c = io.open(p, encoding="utf-8").read()
lines = [l for l in c.splitlines() if l.strip() != "[System]"]
c2 = "\n".join(lines).rstrip() + "\n"
io.open(p, "w", encoding="utf-8").write(c2)
print("removed junk line:", "[System]" not in c2)
