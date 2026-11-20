import { describe, it, expect, afterEach } from 'vitest';
import { flowView } from '../src/flow';
import { staleReadings, trackedEntities } from '../src/model';
import { validateConfig } from '../src/energy-sky-card';
import { editorHelper, editorLabel, formData, nextConfig } from '../src/energy-sky-card-editor';
import { entity, makeHass, mountCard as mount } from './helpers';
import type { EnergySkyCardConfig } from '../src/types';

const CAR = { entity: 'sensor.car', name: 'Voiture', icon: 'mdi:car-electric', soc_entity: 'sensor.car_soc' };
const CONFIG: EnergySkyCardConfig = { type: 'custom:energy-sky-card', production_entity: 'sensor.pv', consumption_entity: 'sensor.home', flow: 'always', consumers: [CAR] };
const READINGS = { 'sensor.pv': 0, 'sensor.home': 8000, 'sensor.car': 7200, 'sensor.car_soc': 64.4 };

afterEach(() => { document.body.innerHTML = ''; });

describe('an appliance\'s charge', () => {
    it('is read, kept within 0 to 100, and absent without the option or a reading', () => {
        expect(flowView(CONFIG, makeHass(READINGS)).consumers[0].soc).toBe(64.4);
        expect(flowView(CONFIG, makeHass({ ...READINGS, 'sensor.car_soc': 104 })).consumers[0].soc).toBe(100);
        expect(flowView(CONFIG, makeHass({ ...READINGS, 'sensor.car_soc': 'unavailable' })).consumers[0].soc).toBeUndefined();
        expect(flowView({ ...CONFIG, consumers: [{ entity: 'sensor.car' }] }, makeHass(READINGS)).consumers[0].soc).toBeUndefined();
    });

    it('fills the ring in the battery\'s colour, the number in the disc, and the title', () => {
        const card = mount(CONFIG, READINGS);
        const node = card.shadowRoot!.querySelector('[data-consumer="0"]')!;
        expect(node.hasAttribute('data-centre')).toBe(true);
        expect(node.querySelector('.centre')?.textContent).toBe('64');
        expect(node.querySelector('.seg')?.getAttribute('data-source')).toBe('batt');
        expect(node.getAttribute('title')).toBe('Voiture · 7,2 kW · 64 %');
        expect(node.getAttribute('aria-label')).toBe('Voiture 7,2 kW 64 %');
    });

    it('leaves an appliance without it as before', () => {
        const card = mount({ ...CONFIG, consumers: [{ entity: 'sensor.car', name: 'Voiture' }] }, READINGS);
        const node = card.shadowRoot!.querySelector('[data-consumer="0"]')!;
        expect(node.hasAttribute('data-centre')).toBe(false);
        expect(node.querySelector('.seg')?.getAttribute('data-source')).toBe('use');
        expect(node.getAttribute('title')).toBe('Voiture');
    });

    it('is tracked and checked for staleness', () => {
        expect(trackedEntities(CONFIG)).toContain('sensor.car_soc');
        const old = { ...entity('sensor.car_soc', 64), last_reported: new Date(Date.now() - 45 * 60000).toISOString() };
        expect(staleReadings(CONFIG, makeHass({ 'sensor.car_soc': old })).has('sensor.car_soc')).toBe(true);
    });
});

describe('always_show', () => {
    it('keeps an appliance in the flow below the threshold', () => {
        const idle = { ...READINGS, 'sensor.car': 0 };
        expect(flowView(CONFIG, makeHass(idle)).consumers[0].shown).toBe(false);
        expect(flowView({ ...CONFIG, consumers: [{ ...CAR, always_show: true }] }, makeHass(idle)).consumers[0].shown).toBe(true);
    });
});

describe('settings', () => {
    it('validates them', () => {
        expect(() => validateConfig({ ...CONFIG, consumers: [{ ...CAR, always_show: true }] })).not.toThrow();
        expect(() => validateConfig({ ...CONFIG, consumers: [{ ...CAR, soc_entity: 3 }] })).toThrow(/consumers: soc_entity must be an entity/);
        expect(() => validateConfig({ ...CONFIG, consumers: [{ ...CAR, always_show: 'yes' }] })).toThrow(/consumers: always_show must be true or false/);
    });

    it('round-trips through the editor, always_show only when on', () => {
        const config = { ...CONFIG, consumers: [{ ...CAR, always_show: true }] };
        expect(formData(config)).toMatchObject({ consumer_1_soc_entity: 'sensor.car_soc', consumer_1_always_show: true });
        expect(nextConfig(config, formData(config)).consumers).toEqual([{ ...CAR, always_show: true }]);
        expect(nextConfig(CONFIG, { ...formData(CONFIG), consumer_1_always_show: false }).consumers).toEqual([CAR]);
        expect(editorLabel('fr', 'consumer_2_soc_entity')).toBe('Charge (%, facultatif)');
        expect(editorLabel('de', 'consumer_1_always_show')).toBe('Immer im Fluss');
        expect(editorHelper('fr', 'consumer_3_always_show')).toMatch(/voiture branchée/);
    });
});
