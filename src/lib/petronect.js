// Busca as licitações abertas do Petronect em tempo de build (endpoint público).
const SETORES = [
  ['Sondagem/Poços', /po[çc]o|sondagem|obturador|revestimento|completa[çc]|workover|perfura|packer|submers|risers?|flowlines?|umbilical/i],
  ['Dutos/Subsea', /duto|flex[íi]ve|subsea|submarin|pipeline|oleoduto|gasoduto|manifold/i],
  ['Manutenção industrial', /manuten[çc]|permutador|v[áa]lvula|caldeiraria|jateamento|integridade|inspe[çc]|paradas?|turnaround|reparo/i],
  ['Engenharia/Obras', /obra|constru[çc]|montagem|engenharia|reforma|edifica[çc]|terraplan|civil/i],
  ['Andaimes/Isolamento', /andaime|isolamento t[ée]rmico/i],
  ['Químicos/Produtos', /clarificante|qu[íi]mic|corros[ãa]o|inibidor|desemulsific|floculante|reagente|catalisador|solvente|amina|carbamida/i],
  ['Equipamentos/Materiais', /equipamento|material|motor|compressor|gerador|transformador|bomba|instrumenta[çc]|tubula|conex|flange|acess[óo]rio|filtro|ventilador/i],
  ['TI/Software/Telecom', /software|licenciamento|sistema de informa|telecom|rede de dados|data center|nuvem|cloud|aplicativo|roteador|vpn/i],
  ['Logística/Transporte', /transporte|log[íi]stica|frota|ve[íi]culo|embarca[çc]|afretamento|navio|rebocador|guindaste|armazenagem/i],
  ['Serviços adm./RH', /publicidade|propaganda|consultoria|treinamento|recursos humanos|limpeza|vigil[âa]ncia|alimenta[çc]|facilities|apoio|financeiro/i],
  ['Meio ambiente/SMS', /ambient|res[íi]duo|efluente|descomissi|inc[êe]ndio|h[íi]dric/i],
  ['Energia/Elétrica', /el[ée]tric|energia|subesta[çc]|fotovolta|e[óo]lic|atuador/i],
];
const setor = t => { for (const [n, re] of SETORES) if (re.test(t)) return n; return 'Outros'; };

export async function getOportunidades() {
  const url = "https://www.petronect.com.br/sap/opu/odata/SAP/YPCON_GET_XML_SRV/getXMLSet('01')?$format=json";
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteBuild/1.0)', 'Accept': 'application/json' } });
    const outer = await res.json();
    const tab = JSON.parse(outer.d.EvXml).TAB || [];
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const rows = [];
    for (const o of tab) {
      if (!o.END_DATE || o.END_DATE === '0000-00-00') continue;
      const fim = new Date(o.END_DATE + 'T00:00:00');
      if (fim < hoje) continue;
      const obj = (o.DESC_OBJ_CONTRAT || o.OPPORT_DESCR || '').replace(/\s+/g, ' ').trim();
      const dias = Math.round((fim - hoje) / 86400000);
      const reg = [...new Set((o.REGIONS || []).map(r => r.REGION).filter(Boolean))].join(',');
      rows.push({ n: o.OPPORT_NUM, o: obj.slice(0, 150), s: setor(obj), a: o.NAT_COVERAGE === 'I' ? 'Int' : 'Nac', r: reg, f: o.END_DATE, d: dias });
    }
    rows.sort((a, b) => a.d - b.d);
    const cont = {};
    rows.forEach(r => cont[r.s] = (cont[r.s] || 0) + 1);
    const contArr = Object.entries(cont).sort((a, b) => b[1] - a[1]).map(([s, c]) => ({ s, c }));
    return { rows, total: rows.length, fecha: rows.filter(r => r.d <= 3).length, cont: contArr, ok: true };
  } catch (e) {
    return { rows: [], total: 0, fecha: 0, cont: [], ok: false };
  }
}
