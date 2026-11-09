# AquaPilot Control — Landing Page de Pré-lançamento

Site responsivo, em português, para apresentar o kit AquaPilot Control e captar **interessados** no lançamento.

> Este pacote não possui checkout nem recebe pagamentos. É uma **lista de interesse**, não uma reserva paga. Características técnicas, composição, preço e data serão comunicados quando confirmados.

## O que está pronto

- Landing page responsiva (celular, tablet e desktop), visual AquaPilot.
- Demonstração interativa **simulada** dos quatro relés, identificada como demonstração.
- Conteúdo e FAQ com separação entre hardware definido e funcionalidades em validação.
- Formulário com validação de nome, e-mail, WhatsApp, tipo de aquário, consentimento LGPD e campo antispam.
- API para Cloudflare Pages Functions com persistência em D1 (atualiza pelo e-mail sem duplicar inscrições).
- Política inicial de privacidade — **precisa identificar o responsável e o canal de contato antes de publicar**.

## Visualização local

Abra `index.html` no navegador para ver a página. O formulário **não envia dados** nesse modo.

Para servir localmente (sem API), execute nesta pasta:

```bash
python -m http.server 8080
```

Acesse `http://localhost:8080`. Para receber inscrições, é preciso publicar a API e vincular o banco D1.

## Publicar com Cloudflare Pages + D1

Use **Git integration** ou **Wrangler CLI**. Não arraste o ZIP no painel Cloudflare Pages para ativar o formulário: a implantação por *drag and drop* não compila a pasta `functions/`.

1. Crie o banco D1 com nome `aquapilot-leads` em Cloudflare → Workers & Pages → D1 ou pela CLI:
   ```bash
   npx wrangler login
   npx wrangler d1 create aquapilot-leads
   ```
2. Inicialize as tabelas no banco remoto, na raiz deste projeto:
   ```bash
   npx wrangler d1 execute aquapilot-leads --remote --file=./db/schema.sql
   ```
3. Crie um projeto Pages chamado, por exemplo, `aquapilot-control`, no painel ou com:
   ```bash
   npx wrangler pages project create
   ```
4. Em Pages → projeto → Settings → Bindings → Add → D1 database, vincule o banco usando a variável **`DB`**. Faça **redeploy** após criar o binding.
5. Faça deploy pela CLI, dentro desta pasta:
   ```bash
   npx wrangler pages deploy . --project-name aquapilot-control
   ```
6. Acesse a URL `.pages.dev` retornada e envie uma inscrição de teste.
7. Consulte as inscrições no painel D1 ou com:
   ```bash
   npx wrangler d1 execute aquapilot-leads --remote --command="SELECT id, nome, email, aquario, created_at FROM interessados ORDER BY id DESC LIMIT 10;"
   ```

**Alternativa Git:** copie a pasta para um repositório e conecte ao Pages (Git). Sem comando de build, saída `.`. Se o site estiver dentro de um subdiretório de um repositório existente, ajuste o **Root directory** nas configurações de build. A pasta `functions/` deve ficar na raiz do projeto Pages.

## Antes de divulgar

- Defina nome/razão social e contato para pedidos de privacidade em `privacidade.html`.
- Confirme o que vai no kit: fonte, caixa, tomadas, sondas e cabos; requisitos e limites elétricos; certificações aplicáveis.
- Defina preço, frete, prazo, garantia, condições de compra e política de reembolso **antes** de receber pagamentos.
- Defina rotina de retenção/exclusão dos contatos e limite o acesso ao D1.
- Se houver spam, adicione Cloudflare Turnstile ou regras WAF. Honeypot sozinho não basta.

## Organização

```
index.html                  Página principal
privacidade.html            Política de privacidade
assets/style.css            Layout responsivo
assets/app.js               Simulação e formulário
assets/aquapilot-mark.svg   Marca original AquaPilot
functions/api/inscricao.js  API Cloudflare Pages
 db/schema.sql              Tabela de inscritos no D1
_headers                    Cabeçalhos de segurança
```

## Notas de produto

- Sem pagamentos, chave Pix, preço fictício, lote artificial ou depoimentos fabricados.
- Os valores 25,2 °C e pH 7,1 são **dados ilustrativos**, não leituras reais.
- O formulário só mostra sucesso depois que a API confirma o banco.
- O site ainda não envia notificações automáticas, nem tem CRM; os dados são armazenados no D1.
- Base de conteúdo: documentação técnica existente `docs/esp32-remote.md`, `docs/ANDROID.md` e `web/icon.svg` no repositório privado AquaPilot.

## Publicação em GitHub Pages (prévia sem coleta)

A versão inicial está preparada para GitHub Pages como **apresentação pública**. O formulário está bloqueado no JavaScript para impedir que visitantes preencham dados sem um backend funcional e sem contato do controlador definido na política de privacidade.

Quando for conectar Cloudflare Pages + D1:
1. Defina o responsável e contato da LGPD e atualize a política de privacidade.
2. Publique pelo Cloudflare com `functions/` e configure o binding `DB`.
3. Habilite `productionSignupEnabled` em `assets/app.js` apenas após validar o armazenamento e o fluxo de exclusão.
4. Ajuste o aviso em `index.html` para indicar formulário ativo.

No GitHub Pages o formulário **não registra interessados**; não há cobrança ou checkout.