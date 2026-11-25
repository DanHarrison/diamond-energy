/* Shared Vue pieces for every page: app shell, logo, icons, charts, business filter. */
(function () {
  'use strict';
  const { reactive, watch } = Vue;
  const X = window.DIAMOND;

  // ---- shared business filter (persists across pages) ----
  const qs = new URLSearchParams(location.search);
  const store = reactive({ biz: qs.get('biz') || localStorage.getItem('diamond.biz') || 'all' });
  watch(() => store.biz, v => localStorage.setItem('diamond.biz', v));

  // ---- colours ----
  const C = {
    ink: '#0B2B32', ink2: '#3B575E', muted: '#74898F', line: '#E2EBEB', line2: '#EDF3F3', teal: '#003945', mint: '#30C395',
    received: '#0E7A5C', invoiced: '#2DB88A', forecast: '#86D9BD', pipeline: '#86D9BD',
    paid: '#9C3B28', committed: '#E07A5F', planned: '#E07A5F',
    crit: '#D23F3F', warn: '#C98A00', balance: '#0B2B32',
    biz: { dge: '#1FA67A', climate: '#2B7BD0', ppm: '#D4732A', all: '#0B2B32' }
  };
  const HATCH = { symbol: 'rect', symbolSize: 1, dashArrayX: [1, 0], dashArrayY: [2, 4], rotation: -Math.PI / 4, color: 'rgba(255,255,255,0.72)' };

  // ---- icons (lucide-style strokes) ----
  const P = {
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    octagon: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    up: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    down: '<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',
    bank: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    battery: '<rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
    snow: '<path d="M2 12h20"/><path d="M12 2v20"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    sync: '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'
  };
  const Icon = {
    props: { n: String, s: { default: 16 }, w: { default: 2 } },
    template: `<svg class="ico" :width="s" :height="s" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="w" stroke-linecap="round" stroke-linejoin="round" v-html="P[n] || ''"></svg>`,
    setup() { return { P }; }
  };

  // ---- logo lockup: real Diamond icon + wordmark ----
  const BizLogo = {
    props: { biz: { default: 'group' }, dark: { type: Boolean, default: false }, size: { default: '' } },
    template: `<span class="logo" :class="[size, dark ? 'on-dark' : 'on-light']"><img src="assets/diamond-icon.png" alt="Diamond"><span class="wm"><b>diamond</b><i>{{ sub }}</i></span></span>`,
    computed: { sub() { return this.biz === 'group' ? 'group' : X.BIZ[this.biz].sub; } }
  };

  // ---- ECharts wrapper ----
  const EChart = {
    props: { option: Object, height: { default: 300 } },
    emits: ['pick'],
    template: `<div ref="el" :style="{ height: height + 'px', width: '100%' }"></div>`,
    mounted() {
      this.c = echarts.init(this.$refs.el, null, { renderer: 'svg' });
      this.c.setOption(this.option);
      this.c.on('click', p => this.$emit('pick', p));
      this.ro = new ResizeObserver(() => this.c && this.c.resize());
      this.ro.observe(this.$refs.el);
    },
    watch: { option(o) { if (this.c) this.c.setOption(o, true); } },
    beforeUnmount() { this.ro && this.ro.disconnect(); this.c && this.c.dispose(); }
  };

  // ---- chart defaults ----
  const axisK = v => { const a = Math.abs(v); const s = v < 0 ? '−' : ''; return a >= 1e6 ? `${s}£${(a / 1e6).toFixed(1)}m` : `${s}£${Math.round(a / 1000)}k`; };
  const tooltip = (extra = {}) => Object.assign({
    trigger: 'axis', backgroundColor: '#fff', borderColor: '#E2EBEB', borderWidth: 1, padding: [10, 12],
    textStyle: { color: C.ink, fontFamily: 'Inter', fontSize: 12 }, extraCssText: 'box-shadow:0 8px 28px rgba(11,43,50,.14);border-radius:10px;',
    axisPointer: { type: 'line', lineStyle: { color: '#9DB0B4', type: 'dashed' } }
  }, extra);
  const baseGrid = (g = {}) => Object.assign({ left: 8, right: 14, top: 18, bottom: 6, containLabel: true }, g);
  const valueAxis = (o = {}) => Object.assign({ type: 'value', axisLabel: { color: C.muted, fontSize: 11, formatter: axisK }, splitLine: { lineStyle: { color: '#EDF3F3' } }, axisLine: { show: false }, axisTick: { show: false } }, o);
  const catAxis = (data, o = {}) => Object.assign({ type: 'category', data, axisLabel: { color: C.muted, fontSize: 11 }, axisLine: { lineStyle: { color: '#D5E1E2' } }, axisTick: { show: false } }, o);
  const ttRow = (colour, label, value, hatch) => `<div style="display:flex;gap:8px;align-items:center;margin:2px 0"><i style="width:9px;height:9px;border-radius:2px;display:inline-block;background:${colour};${hatch ? 'background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.75) 0 2px,transparent 2px 4px)' : ''}"></i><span style="color:#3B575E">${label}</span><b style="margin-left:auto;padding-left:18px">${value}</b></div>`;

  // ---- shell ----
  const AppShell = {
    props: { page: String, title: String, subtitle: String, filter: { type: Boolean, default: true } },
    components: { Icon, BizLogo },
    setup() {
      const f = X.fmt;
      return { store, X, f, asAt: f.dayName(X.AS_AT) + ' 2026' };
    },
    template: `
    <div class="app">
      <header class="topnav">
        <a href="index.html"><biz-logo biz="group" dark></biz-logo></a>
        <nav class="tabs">
          <a href="index.html" :class="{on: page==='cash'}"><icon n="wallet" :s="16"></icon>Cash</a>
          <a href="customers.html" :class="{on: page==='customers'}"><icon n="users" :s="16"></icon>Customers</a>
        </nav>
        <div class="right">
          <div v-if="filter" class="seg">
            <button :class="{on: store.biz==='all'}" @click="store.biz='all'">All businesses</button>
            <button v-for="b in X.BUSINESSES" :key="b.id" :class="{on: store.biz===b.id}" @click="store.biz=b.id"><span class="sw" :style="{background:b.colour}"></span>{{ b.short }}</button>
          </div>
          <div class="asat"><i class="live"></i>{{ asAt }}</div>
          <div class="avatar" title="Ian Simm, Group CEO">IS</div>
        </div>
      </header>
      <main class="page"><slot></slot></main>
    </div>`
  };

  function mount(component) {
    const app = Vue.createApp(component);
    app.component('AppShell', AppShell);
    app.component('Icon', Icon);
    app.component('BizLogo', BizLogo);
    app.component('EChart', EChart);
    app.config.globalProperties.f = X.fmt;
    app.config.globalProperties.X = X;
    app.mount('#app');
    return app;
  }

  window.DUI = { store, C, HATCH, axisK, tooltip, baseGrid, valueAxis, catAxis, ttRow, mount, Icon };
})();
