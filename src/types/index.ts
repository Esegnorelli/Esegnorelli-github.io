export interface DadosNegocio {
  id: number
  loja: string
  data: string
  faturamento: number
  ticket_medio: number
  total_clientes: number
  clientes_enriquecer: number
  clientes_novos: number
  taxa_retencao: number
  taxa_recompra_1_2: number
  taxa_recompra_2_3: number
  taxa_recompra_3_4: number
  taxa_recompra_4_5: number
  investimento_marketing: number
  cac: number
  roi: number
  roi_projetado: number
  created_at?: string
}

export interface Loja {
  id: number;
  nome: string;
  created_at?: string;
}

export interface Dashboard {
  id: number;
  loja_id: number;
  data: string;
  faturamento: number;
  ticket_medio: number;
  total_clientes: number;
  clientes_enriquecer: number;
  clientes_novos: number;
  taxa_retencao: number;
  taxa_recompra_1_2: number;
  taxa_recompra_2_3: number;
  taxa_recompra_3_4: number;
  taxa_recompra_4_5: number;
  investimento_marketing: number;
  cac: number;
  roi_marketing: number;
  roi_marketing_projetado: number;
  created_at?: string;
  loja?: Loja;
} 