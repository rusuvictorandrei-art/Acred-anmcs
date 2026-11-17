import openpyxl, json, re, sys
SRC = sys.argv[1]
rows = list(openpyxl.load_workbook(SRC, read_only=True).worksheets[0].iter_rows(values_only=True))[1:]

def clean(s):
    if s is None: return None
    s = re.sub(r'\s+', ' ', str(s)).strip()
    s = re.sub(r'^(Std\.?\s*\d+(\.\d+)*\.?\s+|Cr\.?\s*\d+\.?\s+)', '', s, flags=re.I).strip()
    return s or None

DOMAINS = [("1", "Managementul strategic și organizațional", 7),
           ("2", "Managementul clinic", 7),
           ("3", "Etica medicală și drepturile pacientului", 3)]
std_domain = []
for code, name, n in DOMAINS: std_domain += [(code, i + 1) for i in range(n)]

out = []  # flat indicators
si = ci = ri = ii = 0
cur = {}
for r in rows:
    std, cr, cer, ind = (clean(c) for c in r)
    if std:
        si += 1; ci = 0; cur['std'] = std
    if cr:
        ci += 1; ri = 0; cur['cr'] = cr; cur['cer'] = None
        if not cer: cer = cr  # criteriu fără cerință separată
    if cer:
        ri += 1; ii = 0; cur['cer'] = cer
    if not ind: ind = cur['cer']  # cerință fără indicator separat
    ii += 1
    dom, sn = std_domain[si - 1]
    out.append(dict(domain=dom, std_code=f"{dom}.{sn}", std=cur['std'], ci=ci, cr=cur['cr'], ri=ri, cer=cur['cer'], ii=ii, ind=ind,
                    code=f"S{dom}.{sn}-C{ci}-R{ri}-I{ii}"))
assert si == 17, si
json.dump(out, open('/home/claude/gen/indicators.json', 'w'), ensure_ascii=False, indent=0)
print(len(out), 'indicatori;', len({o['std_code'] for o in out}), 'standarde;', len({(o['std_code'], o['ci']) for o in out}), 'criterii;', len({(o['std_code'], o['ci'], o['ri']) for o in out}), 'cerinte')
codes = [o['code'] for o in out]; assert len(codes) == len(set(codes))
for o in out[:3] + out[-2:]: print(o['code'], '|', o['ind'][:80])
