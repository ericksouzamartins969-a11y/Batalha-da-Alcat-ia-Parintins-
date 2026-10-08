
import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 1. CONFIGURAÇÃO DO SUPABASE
// Substitua pelos dados do seu próprio projeto.
const SUPABASE_URL = "COLE_A_URL_DO_SEU_PROJETO";
const SUPABASE_ANON_KEY = "COLE_SUA_CHAVE_PUBLICA_ANON";

let supabase = null;

if (
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("COLE_A_URL") &&
  !SUPABASE_ANON_KEY.includes("COLE_SUA")
) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 2. DISPONIBILIZAR AS FUNÇÕES PARA O PAINEL
window.AlcateiaAdmin = {
  conectado() {
    return Boolean(supabase);
  },

  async entrar(email, senha) {
    if (!supabase) {
      throw new Error("Configure a URL e a chave pública do Supabase.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) throw error;
    return data;
  },

  async sair() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sessao() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async listarMCs() {
    exigirConexao();
    const { data, error } = await supabase
      .from("mcs")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;
    return data;
  },

  async cadastrarMC(mc) {
    exigirConexao();
    const { data, error } = await supabase
      .from("mcs")
      .insert([{
        nome: mc.nome,
        foto: mc.foto || null,
        instagram: mc.instagram || null,
        biografia: mc.biografia || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listarEventos() {
    exigirConexao();
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: true });

    if (error) throw error;
    return data;
  },

  async cadastrarEvento(evento) {
    exigirConexao();
    const { data, error } = await supabase
      .from("eventos")
      .insert([{
        nome: evento.nome,
        data: evento.data,
        horario: evento.horario,
        local: evento.local,
        descricao: evento.descricao || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listarRanking() {
    exigirConexao();
    const { data, error } = await supabase
      .from("ranking")
      .select("*")
      .order("pontos", { ascending: false });

    if (error) throw error;
    return data;
  },

  async adicionarPontos(mcId, pontos, motivo) {
    exigirConexao();

    if (!Number.isInteger(pontos) || pontos < 0) {
      throw new Error("A pontuação deve ser um número inteiro não negativo.");
    }

    const { data, error } = await supabase
      .from("pontuacoes")
      .insert([{
        mc_id: mcId,
        pontos,
        motivo
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

function exigirConexao() {
  if (!supabase) {
    throw new Error("O Supabase ainda não foi configurado.");
  }
  if (!supabase.auth.getSession) {
    throw new Error("Conexão indisponível.");
  }
}
