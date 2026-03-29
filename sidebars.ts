import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  hrdSidebar: [
    {
      type: 'category',
      label: '👥 HRD',
      collapsible: false,
      items: [
        'hrd/intro',
        'hrd/rekrutmen',
        'hrd/kebijakan-sdm',
        'hrd/prosedur-cuti',
        'hrd/penilaian-kinerja',
      ],
    },
  ],

  financeSidebar: [
    {
      type: 'category',
      label: '💰 Finance',
      collapsible: false,
      items: [
        'finance/intro',
        'finance/prosedur-keuangan',
        'finance/laporan-bulanan',
        'finance/anggaran',
        'finance/reimbursement',
      ],
    },
  ],

  operasionalSidebar: [
    {
      type: 'category',
      label: '⚙️ Operasional',
      collapsible: false,
      items: [
        'operasional/intro',
        'operasional/sop-lapangan',
        'operasional/keselamatan-kerja',
        'operasional/pemeliharaan-alat',
        'operasional/pelaporan-insiden',
      ],
    },
  ],

  itSidebar: [
    {
      type: 'category',
      label: '💻 IT',
      collapsible: false,
      items: [
        'it/intro',
        'it/panduan-teknis',
        'it/keamanan-data',
        'it/infrastruktur',
        'it/troubleshooting',
      ],
    },
  ],

  legalSidebar: [
    {
      type: 'category',
      label: '⚖️ Legal',
      collapsible: false,
      items: [
        'legal/intro',
        'legal/regulasi-perusahaan',
        'legal/kontrak',
        'legal/kepatuhan',
        'legal/privasi-data',
      ],
    },
  ],

  panduanSidebar: [
    {
      type: 'category',
      label: '📖 Panduan',
      collapsible: false,
      items: ['panduan/intro', 'panduan/cara-mencari', 'panduan/peran-akses'],
    },
  ],
};

export default sidebars;
