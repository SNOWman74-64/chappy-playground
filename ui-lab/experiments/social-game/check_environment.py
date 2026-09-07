"""Read-only validation of frozen inputs. Browser access must be checked by each actor."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def main():
    manifest = json.loads((ROOT / 'baseline.json').read_text(encoding='utf-8'))
    failures = []
    for rel, expected in manifest['files'].items():
        path = ROOT / rel
        if not path.is_file():
            failures.append('Missing: ' + rel)
        elif hashlib.sha256(path.read_bytes().replace(b'\r\n', b'\n')).hexdigest() != expected:
            failures.append('Changed: ' + rel)
    data = json.loads((ROOT / 'fixtures/content.json').read_text(encoding='utf-8'))
    for group, expected in [('characters', 12), ('guides', 8), ('events', 3), ('threads', 6)]:
        rows = data[group]
        if len(rows) != expected or len({r['id'] for r in rows}) != expected:
            failures.append('Count/IDs: ' + group)
    chars = {x['id'] for x in data['characters']}
    guides = {x['id'] for x in data['guides']}
    for c in data['characters']:
        if not set(c['partners']) <= chars or not (ROOT / c['image']).is_file():
            failures.append('Character references: ' + c['id'])
    for g in data['guides']:
        if not set(g['characters']) <= chars:
            failures.append('Guide references: ' + g['id'])
    for e in data['events']:
        if e['guide'] not in guides or not (ROOT / e['image']).is_file():
            failures.append('Event references: ' + e['id'])
    if [c['id'] for c in data['characters'] if c['element'] == '火' and c['role'] == '支援'] != ['c05']:
        failures.append('D01 expected fixture result')
    if [t['id'] for t in data['threads'] if t['category'] == '質問'] != ['t01', 't03']:
        failures.append('B01 expected fixture result')
    for failure in failures:
        print('FAIL:', failure)
    if failures:
        return 1
    print('PASS: fixed inputs, IDs, references and acceptance fixture expectations.')
    print('Browser: NOT tested by this script; each implementation actor must open environment.html.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
