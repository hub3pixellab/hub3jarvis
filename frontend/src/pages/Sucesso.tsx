import { useEffect, useState } from "react";
import { abrirApresentacao, statusCheckout, STORAGE_DADOS } from "@/lib/agnesApi";

const AZUL = "#0B1B3D";
const DOURADO = "#D4AF37";

export default function Sucesso() {
  const [estado, setEstado] = useState<"verificando" | "pago" | "nao_pago" | "erro">("verificando");
  const [dados, setDados] = useState<{ nome: string; data_nascimento: string; signo?: string; foco?: string } | null>(null);
  const [baixando, setBaixando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const salvos = localStorage.getItem(STORAGE_DADOS);
        if (salvos) setDados(JSON.parse(salvos));
        const sessionId = new URLSearchParams(window.location.search).get("session_id");
        if (!sessionId) {
          setEstado("nao_pago");
          return;
        }
        const res = await statusCheckout(sessionId);
        setEstado(res.pago ? "pago" : "nao_pago");
      } catch (e) {
        setEstado("erro");
        setMensagemErro(e instanceof Error ? e.message : "Erro ao validar o pagamento");
      }
    })();
  }, []);

  async function baixar() {
    if (!dados) {
      setMensagemErro("Não encontrei seus dados. Preencha o formulário novamente.");
      return;
    }
    setBaixando(true);
    setMensagemErro("");
    try {
      await abrirApresentacao(dados);
    } catch (e) {
      setMensagemErro(e instanceof Error ? e.message : "Erro ao gerar a apresentacao");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${AZUL} 0%, #0A0A0A 100%)`,
        color: "#F5F1E6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          letterSpacing: "0.35em",
          fontSize: "0.75rem",
          color: DOURADO,
          marginBottom: "2.5rem",
        }}
      >
        SEU GUIA • SEU DESTINO
      </p>
      <div
        aria-hidden
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: `1px solid ${DOURADO}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DOURADO,
          fontSize: "1.75rem",
          marginBottom: "1.75rem",
        }}
      >
        {estado === "pago" ? "✦" : estado === "verificando" ? "◌" : "✕"}
      </div>
      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          color: DOURADO,
          margin: 0,
        }}
      >
        {estado === "pago" && "Pagamento confirmado!"}
        {estado === "verificando" && "Verificando seu pagamento..."}
        {estado === "nao_pago" && "Pagamento não confirmado"}
        {estado === "erro" && "Não foi possível validar"}
      </h1>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.15rem",
          maxWidth: 520,
          lineHeight: 1.7,
          opacity: 0.85,
          marginTop: "1rem",
        }}
      >
        {estado === "pago" &&
          "Sua jornada está selada. O Mestre Agnes já pode revelar o mapa que o universo desenhou para você."}
        {estado === "verificando" && "Consultando os astros e confirmando sua sessão no Stripe..."}
        {estado === "nao_pago" &&
          "Ainda não recebemos a confirmação. Se você acabou de pagar, aguarde e recarregue esta página."}
        {estado === "erro" && mensagemErro}
      </p>
      {estado === "pago" && (
        <button
          onClick={baixar}
          disabled={baixando}
          style={{
            marginTop: "2.5rem",
            padding: "0.9rem 2.25rem",
            fontFamily: "'Jost', sans-serif",
            letterSpacing: "0.18em",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            color: AZUL,
            backgroundColor: DOURADO,
            border: "none",
            borderRadius: 2,
            cursor: baixando ? "wait" : "pointer",
            opacity: baixando ? 0.65 : 1,
          }}
        >
          {baixando ? "Consultando os astros..." : "Gerar e baixar meu relatório"}
        </button>
      )}
      <a
        href="/"
        style={{
          marginTop: "3rem",
          color: DOURADO,
          opacity: 0.7,
          fontSize: "0.8rem",
          fontFamily: "'Jost', sans-serif",
          letterSpacing: "0.1em",
        }}
      >
        ← Voltar ao início
      </a>
    </main>
  );
}
