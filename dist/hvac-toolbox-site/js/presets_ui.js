// Shared preset editor — a card that lets the user pick, edit, save, rename, duplicate and delete
// design-condition presets, so the company standards live in the app instead of in the source code.
//
// Used by any module that has a set of design conditions (currently the coil module). The module hands
// in `readCurrent()` to expose its live inputs, and receives the chosen preset back through onApply().
import { h, form, res, flag, results, seg } from './ui.js';
import {
  PRESET_FIELDS, PRESET_DERIVED, loadPresets, savePresets, resetPresets, storageAvailable,
  newPresetId, FACTORY_PRESETS,
} from './data/presets.js';

const I18N = {
  title: { en: 'Design Presets', zh: '設計預設' },
  desc: {
    en: 'Pick a preset, edit any value, and it is saved in this browser. Use it as your company standard set.',
    zh: '揀一個預設、直接改任何數值，會存於本瀏覽器。可作為公司標準工況組。',
  },
  pick: { en: 'Preset', zh: '預設選擇' },
  name: { en: 'Name', zh: '名稱' },
  apply: { en: 'Apply to inputs', zh: '套用至輸入' },
  update: { en: 'Update from current inputs', zh: '以目前輸入更新' },
  dup: { en: 'Duplicate', zh: '新增副本' },
  del: { en: 'Delete', zh: '刪除' },
  factory: { en: 'Restore factory set', zh: '還原出廠預設' },
  saved: { en: 'Saved in this browser', zh: '已儲存於本瀏覽器' },
  notSaved: {
    en: 'This browser blocks local storage, so edits last only until the page is reloaded.',
    zh: '此瀏覽器不允許本地儲存，修改只會保留到重新載入為止。',
  },
  applied: { en: 'Applied:', zh: '已套用：' },
  derived: { en: 'Computed from the values above', zh: '由上方數值計算' },
  delLast: { en: 'At least one preset must remain.', zh: '至少要保留一個預設。' },
};

const LBL = (L, f) => L(f.label);

/**
 * @param {{L:Function, readCurrent?:Function, onApply?:Function, extraFields?:Array}} opts
 * @returns {HTMLElement} the preset card
 */
export function presetCard({ L, readCurrent, onApply, extraFields = [], formula, src }) {
  let list = loadPresets();
  let sel = list[0].id;

  const body = h('div');
  const card = h('div', { class: 'card' },
    h('h3', {}, L(I18N.title)),
    h('div', { class: 'sub' }, L(I18N.desc)),
    body);

  const select = h('select', { id: 'preset-pick' });
  const nameInput = h('input', { type: 'text', id: 'preset-name', autocomplete: 'off' });
  const grid = h('div', { class: 'grid4' });
  const derivedBox = h('div', { class: 'preset-derived' });
  const status = h('div', { class: 'note' });
  const actions = h('div', { class: 'preset-actions' });

  const current = () => list.find((p) => p.id === sel) ?? list[0];

  function persist() {
    const ok = savePresets(list);
    status.textContent = ok ? `${L(I18N.saved)} · ${list.length}` : L(I18N.notSaved);
    status.className = ok ? 'note' : 'note warn';
  }

  function refreshSelect() {
    select.innerHTML = '';
    for (const p of list) {
      select.append(h('option', { value: p.id, selected: p.id === sel ? 'selected' : null },
        L(p.name)));
    }
    select.value = sel;
  }

  // The field form is rebuilt per preset so its inputs always show the stored numbers.
  let fieldForm = null;
  function buildFields() {
    const p = current();
    grid.innerHTML = '';
    fieldForm = form(
      [...PRESET_FIELDS, ...extraFields].map((f) => ({
        key: f.key, label: LBL(L, f), unit: f.unit, def: p.values[f.key], step: 'any',
      })),
      (st) => { Object.assign(p.values, st); persist(); drawDerived(); },
      'grid4', 'preset-');
    grid.append(fieldForm.grid);
    nameInput.value = L(p.name);
    drawDerived();
  }

  function drawDerived() {
    const p = current();
    const items = PRESET_DERIVED.map((d) => res((typeof d.label === 'object' ? L(d.label) : d.label),
      d.from(p.values), d.unit, { digits: 2 }));
    results(derivedBox, items);
    derivedBox.append(h('div', { class: 'note' }, L(I18N.derived)));
  }

  function drawActions() {
    actions.innerHTML = '';
    const btn = (label, cls, fn, disabled) => h('button', {
      type: 'button', class: 'btn ' + (cls || ''), disabled: disabled ? 'disabled' : null,
      onclick: fn,
    }, label);
    actions.append(
      btn(L(I18N.apply), 'btn-primary', () => {
        onApply?.(current().values, current());
        status.textContent = L(I18N.applied) + ' ' + L(current().name);
        status.className = 'note';
      }),
      readCurrent ? btn(L(I18N.update), '', () => {
        Object.assign(current().values, readCurrent());
        persist();
        buildFields();
      }) : null,
      btn(L(I18N.dup), '', () => {
        const p = current();
        const copy = {
          id: newPresetId(list),
          name: { en: L(p.name) + ' copy', zh: L(p.name) + '（副本）' },
          values: { ...p.values },
        };
        list = [...list, copy];
        sel = copy.id;
        persist();
        refreshSelect();
        buildFields();
      }),
      btn(L(I18N.del), '', () => {
        if (list.length <= 1) { status.textContent = L(I18N.delLast); status.className = 'note warn'; return; }
        list = list.filter((p) => p.id !== sel);
        sel = list[0].id;
        persist();
        refreshSelect();
        buildFields();
      }, list.length <= 1),
      btn(L(I18N.factory), '', () => {
        list = resetPresets();
        sel = list[0].id;
        persist();
        refreshSelect();
        buildFields();
      }),
    );
  }

  select.addEventListener('change', () => { sel = select.value; buildFields(); drawActions(); });
  nameInput.addEventListener('input', () => {
    const p = current();
    p.name = { en: nameInput.value, zh: nameInput.value };
    persist();
    refreshSelect();
  });

  body.append(
    h('div', { class: 'grid3' },
      h('div', { class: 'field' }, h('label', { for: 'preset-pick' }, L(I18N.pick)), h('div', { class: 'ctl' }, select)),
      h('div', { class: 'field' }, h('label', { for: 'preset-name' }, L(I18N.name)), h('div', { class: 'ctl' }, nameInput))),
    grid, derivedBox, actions, status,
    formula ? h('div', { class: 'formula' }, formula) : null,
    src ? h('div', { class: 'note' }, h('span', {}, '出處：'), h('code', {}, src)) : null,
  );

  refreshSelect();
  buildFields();
  drawActions();
  persist();
  if (!storageAvailable()) status.className = 'note warn';

  return card;
}

export { FACTORY_PRESETS };
