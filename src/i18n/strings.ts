import type { LStr } from './index';

/**
 * All UI strings, keyed by a dotted name, with a Portuguese and English
 * version. Data-driven strings (cat/obstacle/relic/achievement names, etc.)
 * live bilingually in their own `data/*` modules instead.
 */
export const STRINGS: Record<string, LStr> = {
  // ---------- common ----------
  'common.back': { pt: 'Voltar', en: 'Back' },
  'common.save': { pt: 'Salvar', en: 'Save' },
  'common.cancel': { pt: 'Cancelar', en: 'Cancel' },
  'common.loading': { pt: 'Carregando…', en: 'Loading…' },
  'common.help': { pt: 'Ajuda', en: 'Help' },
  'common.close': { pt: 'Fechar', en: 'Close' },

  // ---------- home ----------
  'home.tagline': { pt: 'Match-3 de Gatinhos', en: 'Kitten Match-3' },
  'home.blurb': {
    pt: 'Cuide de uma casa cheia de gatinhos bagunceiros!',
    en: 'Take care of a house full of mischievous kittens!',
  },
  'home.continue': { pt: '▶ Continuar', en: '▶ Continue' },
  'home.play': { pt: '🐾 Jogar', en: '🐾 Play' },
  'home.ranking': { pt: '🏆 Ranking', en: '🏆 Ranking' },
  'home.achievements': { pt: '🏅 Conquistas', en: '🏅 Achievements' },
  'home.howToPlay': { pt: '❓ Como Jogar', en: '❓ How to Play' },
  'home.sound': { pt: 'Som', en: 'Sound' },
  'home.chooseMode': { pt: 'Escolha um modo', en: 'Choose a mode' },
  'home.modeLevels': { pt: '🐾 Fases', en: '🐾 Levels' },
  'home.modeLevelsDesc': {
    pt: 'Campanha com objetivos por fase.',
    en: 'Campaign with per-level goals.',
  },
  'home.modeAdventure': {
    pt: '🗺️ Aventura (Roguelite)',
    en: '🗺️ Adventure (Roguelite)',
  },
  'home.modeAdventureDesc': {
    pt: 'Suba andares com relíquias e chefes.',
    en: 'Climb floors with relics and bosses.',
  },
  'home.modeBlitz': { pt: '⚡ Relâmpago', en: '⚡ Blitz' },
  'home.modeBlitzDesc': {
    pt: 'Máximo de pontos contra o relógio.',
    en: 'Score as much as you can against the clock.',
  },
  'home.modeDaily': { pt: '📅 Diário', en: '📅 Daily' },
  'home.modeDailyDesc': {
    pt: 'Um desafio novo todo dia.',
    en: 'A fresh challenge every day.',
  },
  'home.language': { pt: 'Idioma', en: 'Language' },

  // ---------- auth ----------
  'auth.signIn': { pt: 'Entrar', en: 'Sign in' },
  'auth.signUp': { pt: 'Criar conta', en: 'Create account' },
  'auth.email': { pt: 'E-mail', en: 'Email' },
  'auth.password': { pt: 'Senha', en: 'Password' },
  'auth.nickname': { pt: 'Apelido no ranking', en: 'Ranking nickname' },
  'auth.emailPlaceholder': { pt: 'voce@email.com', en: 'you@email.com' },
  'auth.passwordPlaceholder': {
    pt: 'mínimo 6 caracteres',
    en: 'at least 6 characters',
  },
  'auth.nicknamePlaceholder': {
    pt: 'Seu nome no ranking',
    en: 'Your ranking name',
  },
  'auth.errEmail': { pt: 'Digite seu e-mail.', en: 'Enter your email.' },
  'auth.errPassword': {
    pt: 'A senha precisa de pelo menos 6 caracteres.',
    en: 'Password must be at least 6 characters.',
  },
  'auth.errNickname': {
    pt: 'Escolha um apelido para o ranking.',
    en: 'Choose a nickname for the ranking.',
  },
  'auth.errResetEmail': {
    pt: 'Digite seu e-mail acima para redefinir a senha.',
    en: 'Enter your email above to reset the password.',
  },
  'auth.resetSent': {
    pt: 'Enviamos um link para {email}. Não esqueça de checar a caixa de spam/lixo eletrônico.',
    en: 'We sent a link to {email}. Remember to check your spam/junk folder.',
  },
  'auth.submitSignUp': { pt: 'Criar conta 🐾', en: 'Create account 🐾' },
  'auth.submitSignIn': { pt: 'Entrar ▶', en: 'Sign in ▶' },
  'auth.forgot': { pt: 'Esqueci minha senha', en: 'Forgot my password' },
  'auth.hintHaveAccount': {
    pt: 'Já tem conta? Toque em "Entrar" acima.',
    en: 'Already have an account? Tap "Sign in" above.',
  },
  'auth.hintNewHere': {
    pt: 'Novo por aqui? Toque em "Criar conta" acima.',
    en: 'New here? Tap "Create account" above.',
  },
  'auth.privacyNoticePre': {
    pt: 'Ao criar uma conta, você aceita nossa ',
    en: 'By creating an account, you accept our ',
  },
  'auth.privacyLink': {
    pt: 'Política de Privacidade',
    en: 'Privacy Policy',
  },

  // ---------- leaderboard ----------
  'lb.title': { pt: '🏆 Ranking', en: '🏆 Ranking' },
  'lb.localMode': { pt: 'Modo local', en: 'Local mode' },
  'lb.localModeDesc': {
    pt: 'Configure o Firebase para login e ranking global.',
    en: 'Set up Firebase for login and the global ranking.',
  },
  'lb.loadingAccount': { pt: 'Carregando conta…', en: 'Loading account…' },
  'lb.connected': {
    pt: '🌍 Conectado · ranking global',
    en: '🌍 Connected · global ranking',
  },
  'lb.profile': { pt: '👤 Perfil', en: '👤 Profile' },
  'lb.signInPrompt': {
    pt: 'Entre ou crie uma conta para salvar sua pontuação no ranking global.',
    en: 'Sign in or create an account to save your score to the global ranking.',
  },
  'lb.signInBtn': {
    pt: '🔑 Entrar / Criar conta',
    en: '🔑 Sign in / Create account',
  },
  'lb.thisWeek': { pt: '🗓️ Esta semana', en: '🗓️ This week' },
  'lb.allTime': { pt: '👑 Todos os tempos', en: '👑 All time' },
  'lb.filterBestDay': { pt: '📅 Melhor dia', en: '📅 Best day' },
  'lb.filterDaily': { pt: '📅 Diário', en: '📅 Daily' },
  'lb.filterBlitz': { pt: '⚡ Relâmpago', en: '⚡ Blitz' },
  'lb.filterAdventure': { pt: '🗺️ Aventura', en: '🗺️ Adventure' },
  'lb.filterAll': { pt: 'Geral', en: 'Overall' },
  'lb.byLevel': { pt: 'Por fase…', en: 'By level…' },
  'lb.levelN': { pt: 'Fase {n}', en: 'Level {n}' },
  'lb.levelShort': { pt: 'F', en: 'L' },
  'lb.captionAllTime': {
    pt: '👑 Recordes de todos os tempos · nunca zera',
    en: '👑 All-time records · never resets',
  },
  'lb.captionDaily': { pt: '📅 Ranking de hoje', en: "📅 Today's ranking" },
  'lb.captionWeekly': {
    pt: '🗓️ {week} · zera toda semana',
    en: '🗓️ {week} · resets every week',
  },
  'lb.empty': {
    pt: 'Ainda sem pontuações. Seja o primeiro! 🐾',
    en: 'No scores yet. Be the first! 🐾',
  },
  'lb.you': { pt: 'Você', en: 'You' },
  'lb.youParen': { pt: '(você)', en: '(you)' },
  'lb.nickPlaceholder': { pt: 'Seu nome', en: 'Your name' },

  // ---------- achievements ----------
  'ach.title': { pt: '🏅 Conquistas', en: '🏅 Achievements' },
  'ach.unlockedCount': {
    pt: '{done} / {total} desbloqueadas',
    en: '{done} / {total} unlocked',
  },

  // ---------- profile ----------
  'profile.notConnected': {
    pt: 'Você não está conectado.',
    en: "You're not signed in.",
  },
  'profile.backToRanking': {
    pt: 'Voltar ao ranking',
    en: 'Back to ranking',
  },
  'profile.title': { pt: '👤 Perfil', en: '👤 Profile' },
  'profile.fixedId': {
    pt: 'Seu ID fixo no ranking: #{tag} (não muda quando você troca o apelido)',
    en: 'Your fixed ranking ID: #{tag} (it stays the same when you change your nickname)',
  },
  'profile.stars': { pt: 'estrelas', en: 'stars' },
  'profile.achievements': { pt: 'conquistas', en: 'achievements' },
  'profile.record': { pt: 'recorde', en: 'best' },
  'profile.nickSaved': { pt: 'Apelido salvo!', en: 'Nickname saved!' },
  'profile.sending': { pt: 'Enviando…', en: 'Sending…' },
  'profile.resetPassword': {
    pt: '📧 Redefinir senha',
    en: '📧 Reset password',
  },
  'profile.signOut': { pt: '🚪 Sair da conta', en: '🚪 Sign out' },
  'profile.resetSent': {
    pt: 'E-mail enviado para {email}. Cheque também a caixa de spam/lixo eletrônico.',
    en: 'Email sent to {email}. Also check your spam/junk folder.',
  },
  'profile.deleteLink': { pt: 'Excluir minha conta', en: 'Delete my account' },
  'profile.deleteTitle': { pt: 'Excluir conta', en: 'Delete account' },
  'profile.deleteWarn': {
    pt: 'Isso apaga sua conta, suas pontuações no ranking e o progresso salvo na nuvem.',
    en: 'This deletes your account, your ranking scores and your cloud-saved progress.',
  },
  'profile.deleteWarnBold': {
    pt: 'Não dá para desfazer.',
    en: "This can't be undone.",
  },
  'profile.confirmPassword': {
    pt: 'Confirme sua senha:',
    en: 'Confirm your password:',
  },
  'profile.passwordPlaceholder': { pt: 'Sua senha', en: 'Your password' },
  'profile.errPassword': {
    pt: 'Digite sua senha para confirmar.',
    en: 'Enter your password to confirm.',
  },
  'profile.deleting': { pt: 'Excluindo…', en: 'Deleting…' },
  'profile.deleteConfirm': {
    pt: 'Excluir conta permanentemente',
    en: 'Delete account permanently',
  },

  // ---------- level select ----------
  'levelSelect.title': { pt: 'Escolha uma Fase', en: 'Choose a Level' },
  'goal.score': { pt: '{n} pts', en: '{n} pts' },
  'goal.collect': { pt: 'Colete {n}', en: 'Collect {n}' },
  'goal.boxes': { pt: '{n} caixas', en: '{n} boxes' },
  'goal.yarns': { pt: '{n} novelos', en: '{n} yarns' },
  'goal.boss': { pt: 'Chefe {n}x', en: 'Boss {n}x' },

  // ---------- relic select ----------
  'relic.floorDone': {
    pt: '🗺️ Andar {n} concluído!',
    en: '🗺️ Floor {n} cleared!',
  },
  'relic.totalScore': { pt: 'Pontuação total', en: 'Total score' },
  'relic.choose': { pt: 'Escolha uma relíquia', en: 'Choose a relic' },
  'relic.stackHint': {
    pt: 'Relíquias repetidas se acumulam e ficam mais fortes! 🔁',
    en: 'Duplicate relics stack and get stronger! 🔁',
  },
  'relic.haveStack': {
    pt: 'Você já tem — pegar deixa ×{n}',
    en: 'You already have it — picking makes it ×{n}',
  },
  'relic.pick': { pt: 'Pegar →', en: 'Pick →' },
  'relic.endAdventure': {
    pt: '← Encerrar aventura',
    en: '← End adventure',
  },
  'relic.yours': { pt: 'Suas relíquias', en: 'Your relics' },

  // ---------- game ----------
  'game.modeDaily': { pt: '📅 Diário', en: '📅 Daily' },
  'game.modeBlitz': { pt: '⚡ Relâmpago', en: '⚡ Blitz' },
  'game.modeFloor': { pt: '🗺️ Andar {n}', en: '🗺️ Floor {n}' },
  'game.modeLevel': { pt: 'Fase {n}', en: 'Level {n}' },
  'game.useBooster': {
    pt: 'Toque no tabuleiro para usar o booster 🎯',
    en: 'Tap the board to use the booster 🎯',
  },
  'game.swapHint': {
    pt: 'Arraste ou toque para trocar dois gatinhos',
    en: 'Drag or tap to swap two kittens',
  },
  'game.home': { pt: '← Início', en: '← Home' },

  // ---------- counters ----------
  'counter.moves': { pt: 'Movimentos', en: 'Moves' },
  'counter.score': { pt: 'Pontos', en: 'Score' },
  'counter.time': { pt: 'Tempo', en: 'Time' },
  'counter.remaining': { pt: 'Restante', en: 'Left' },

  // ---------- victory ----------
  'victory.title': { pt: 'Fase Concluída!', en: 'Level Complete!' },
  'victory.points': { pt: 'Pontos', en: 'Points' },
  'victory.timeRow': { pt: '⏱️ Tempo ({time})', en: '⏱️ Time ({time})' },
  'victory.highScore': { pt: 'High Score', en: 'High Score' },
  'victory.newRecord': { pt: '🎉 Novo recorde!', en: '🎉 New record!' },
  'victory.loginPrompt': {
    pt: 'Entre no ranking para salvar sua pontuação online 🌍',
    en: 'Sign in to the ranking to save your score online 🌍',
  },
  'victory.continue': { pt: 'Continuar ▶', en: 'Continue ▶' },
  'victory.levelMap': { pt: 'Mapa de Fases', en: 'Level Map' },
  'victory.repeat': { pt: '🔁 Repetir', en: '🔁 Replay' },
  'victory.rankingLogin': { pt: '🏆 Entrar', en: '🏆 Sign in' },
  'victory.ranking': { pt: '🏆 Ranking', en: '🏆 Ranking' },

  // ---------- defeat ----------
  'defeat.title': { pt: 'Sem movimentos!', en: 'Out of moves!' },
  'defeat.subtitle': {
    pt: 'Faltou pouco para cuidar de todos os gatinhos…',
    en: 'So close to caring for all the kittens…',
  },
  'defeat.retry': { pt: '🔁 Tentar novamente', en: '🔁 Try again' },
  'defeat.back': { pt: '🏠 Voltar', en: '🏠 Back' },

  // ---------- results ----------
  'results.dailyTitle': { pt: 'Desafio Diário!', en: 'Daily Challenge!' },
  'results.adventureTitle': { pt: 'Fim da Aventura!', en: 'Adventure Over!' },
  'results.blitzTitle': { pt: 'Tempo Esgotado!', en: "Time's Up!" },
  'results.dailySubtitle': {
    pt: 'Volte amanhã para um novo desafio 🐱',
    en: 'Come back tomorrow for a new challenge 🐱',
  },
  'results.adventureSubtitle': {
    pt: 'Você chegou ao Andar {n}! 🐾',
    en: 'You reached Floor {n}! 🐾',
  },
  'results.blitzSubtitle': {
    pt: 'Pontuação enviada ao ranking semanal 🏆',
    en: 'Score sent to the weekly ranking 🏆',
  },
  'results.floorBadge': { pt: '🗺️ Andar {n}', en: '🗺️ Floor {n}' },
  'results.points': { pt: '{score} pontos', en: '{score} points' },
  'results.yourBest': { pt: '🎉 Seu melhor!', en: '🎉 Your best!' },
  'results.share': { pt: '📤 Compartilhar', en: '📤 Share' },
  'results.copied': { pt: '✅ Copiado!', en: '✅ Copied!' },
  'results.shared': { pt: '✅ Compartilhado!', en: '✅ Shared!' },
  'results.shareFailed': { pt: '❌ Falhou', en: '❌ Failed' },
  'results.viewRanking': { pt: '🏆 Ver Ranking', en: '🏆 View Ranking' },
  'results.playAgain': { pt: '🔁 Jogar de novo', en: '🔁 Play again' },
  'results.home': { pt: '🏠 Início', en: '🏠 Home' },

  // ---------- objectives ----------
  'obj.score': { pt: 'Faça {n} pontos', en: 'Score {n} points' },
  'obj.collect': { pt: 'Colete {n}x {cat}', en: 'Collect {n}x {cat}' },
  'obj.collectFallback': { pt: 'gatos', en: 'cats' },
  'obj.breakBox': { pt: 'Quebre {n} caixas', en: 'Break {n} boxes' },
  'obj.yarn': { pt: 'Ative {n} novelos', en: 'Activate {n} yarns' },
  'obj.boss': {
    pt: 'Carregue o Gato Chefe {n}x',
    en: 'Charge the Boss Cat {n}x',
  },
  'obj.default': { pt: 'Objetivo', en: 'Objective' },

  // ---------- boss meter ----------
  'boss.label': { pt: 'Gato Chefe', en: 'Boss Cat' },
  'boss.ready': { pt: '• Pronto!', en: '• Ready!' },

  // ---------- error boundary ----------
  'error.title': { pt: 'Algo deu errado', en: 'Something went wrong' },
  'error.body': {
    pt: 'Tivemos um probleminha. Seu progresso está salvo — é só recarregar.',
    en: 'We hit a small snag. Your progress is saved — just reload.',
  },
  'error.reload': { pt: 'Recarregar', en: 'Reload' },

  // ---------- help modal ----------
  'help.title': { pt: 'Gatinhos & Poderes', en: 'Kittens & Powers' },
  'help.basicCats': { pt: '🐾 Gatos Básicos', en: '🐾 Basic Cats' },
  'help.specialCats': { pt: '⭐ Gatos Especiais', en: '⭐ Special Cats' },
  'help.howToCreate': { pt: 'Como criar: {how}', en: 'How to create: {how}' },
  'help.obstacles': { pt: '📦 Obstáculos', en: '📦 Obstacles' },
  'help.bossTitle': { pt: '👑 Gato Chefe', en: '👑 Boss Cat' },
  'help.bossBodyPre': { pt: 'Combos enchem a barra do Chefe. Cheia, ele faz a ', en: 'Combos fill the Boss bar. When full, he does the ' },
  'help.bossMove': { pt: 'Espreguiçada Real', en: 'Royal Stretch' },
  'help.bossBodyPost': {
    pt: ': remove todos os gatos do tipo mais comum do tabuleiro!',
    en: ': it removes every cat of the most common type on the board!',
  },
  'help.gotIt': { pt: 'Entendi! 🐱', en: 'Got it! 🐱' },

  // ---------- tutorial ----------
  'tut.prev': { pt: '← Voltar', en: '← Back' },
  'tut.skip': { pt: 'Pular', en: 'Skip' },
  'tut.start': { pt: 'Começar! 🐾', en: 'Start! 🐾' },
  'tut.next': { pt: 'Próximo →', en: 'Next →' },
  'tut.1.title': { pt: 'Bem-vindo ao Cat Match!', en: 'Welcome to Cat Match!' },
  'tut.1.text': {
    pt: 'Combine 3 ou mais gatinhos iguais para fazê-los sumir e ganhar pontos.',
    en: 'Match 3 or more identical kittens to clear them and earn points.',
  },
  'tut.2.title': { pt: 'Como jogar', en: 'How to play' },
  'tut.2.text': {
    pt: 'Arraste um gato na direção desejada — ou toque em dois vizinhos para trocá-los. A troca só vale se formar uma combinação.',
    en: 'Drag a cat in any direction — or tap two neighbors to swap them. A swap only works if it forms a match.',
  },
  'tut.3.title': { pt: 'Combinações especiais', en: 'Special matches' },
  'tut.3.text': {
    pt: '3 iguais somem. 4 em linha criam um Ninja (limpa linha/coluna). 5 criam um Mago. Em formato L ou T criam o Bravo (explode 3x3).',
    en: '3 in a row clear. 4 in a line make a Ninja (clears a row/column). 5 make a Magician. An L or T shape makes the Angry cat (blasts a 3x3).',
  },
  'tut.4.title': { pt: 'Cada gato tem um poder', en: 'Each cat has a power' },
  'tut.4.text': {
    pt: 'Laranja: +pontos · Cinza: dá dica · Branco: transforma vizinho · Preto: quebra obstáculo · Siamês: carrega o Chefe · Rajado: empurra peças.',
    en: 'Orange: +points · Gray: gives a hint · White: transforms a neighbor · Black: breaks an obstacle · Siamese: charges the Boss · Tabby: pushes tiles.',
  },
  'tut.5.title': { pt: 'Novelo de Lã', en: 'Ball of Yarn' },
  'tut.5.text': {
    pt: 'Combine ao lado de um novelo e ele rola pelo tabuleiro, limpando um caminho inteiro!',
    en: 'Match next to a yarn ball and it rolls across the board, clearing a whole path!',
  },
  'tut.6.title': { pt: 'Gato Chefe', en: 'Boss Cat' },
  'tut.6.text': {
    pt: 'Seus combos enchem a barra do Chefe. Quando enche, ele acorda e remove todos os gatos do tipo mais comum do tabuleiro.',
    en: 'Your combos fill the Boss bar. When full, he wakes up and removes every cat of the most common type on the board.',
  },
  'tut.7.title': { pt: 'Obstáculos', en: 'Obstacles' },
  'tut.7.text': {
    pt: 'Caixas precisam de 2 danos para quebrar. Faça combinações ao lado delas. Arranhadores bloqueiam a queda das peças.',
    en: 'Boxes need 2 hits to break. Match next to them. Scratchers block tiles from falling.',
  },
  'tut.8.title': { pt: 'Objetivo & tempo', en: 'Goal & time' },
  'tut.8.text': {
    pt: 'Cumpra o objetivo antes de acabar os movimentos. Quanto mais rápido terminar, maior o seu High Score!',
    en: 'Complete the goal before you run out of moves. The faster you finish, the higher your High Score!',
  },
  'tut.9.title': { pt: 'Modos de jogo', en: 'Game modes' },
  'tut.9.text': {
    pt: 'Fases (campanha), Desafio Diário, Relâmpago (60s) e Aventura — uma jornada roguelite onde você escolhe relíquias entre os andares. Divirta-se! 🐾',
    en: 'Levels (campaign), Daily Challenge, Blitz (60s) and Adventure — a roguelite journey where you pick relics between floors. Have fun! 🐾',
  },

  // ---------- store toasts ----------
  'toast.bossRoyalStretch': {
    pt: '👑 Gato Chefe: Espreguiçada Real!',
    en: '👑 Boss Cat: Royal Stretch!',
  },
  'toast.yarnRolling': { pt: '🧶 Novelo rolando!', en: '🧶 Yarn rolling!' },
  'toast.freeMove': { pt: '🆓 Jogada grátis!', en: '🆓 Free move!' },
  'toast.extraMoves': {
    pt: '🐾 +{n} movimentos extras!',
    en: '🐾 +{n} extra moves!',
  },
  'toast.floorGoal': {
    pt: '🗺️ Andar {n} — meta {target} pts',
    en: '🗺️ Floor {n} — goal {target} pts',
  },
  'toast.achievement': {
    pt: '🏅 Conquista: {name}',
    en: '🏅 Achievement: {name}',
  },
  'toast.notConnected': {
    pt: 'Você não está conectado.',
    en: "You're not signed in.",
  },
  'toast.deletePartial': {
    pt: 'Seus dados foram removidos, mas não foi possível excluir a conta agora. Tente de novo. ({err})',
    en: 'Your data was removed, but the account could not be deleted right now. Please try again. ({err})',
  },

  // ---------- auth service errors ----------
  'authErr.invalidEmail': { pt: 'E-mail inválido.', en: 'Invalid email.' },
  'authErr.emailInUse': {
    pt: 'Este e-mail já está em uso.',
    en: 'This email is already in use.',
  },
  'authErr.weakPassword': {
    pt: 'A senha precisa de pelo menos 6 caracteres.',
    en: 'Password must be at least 6 characters.',
  },
  'authErr.missingPassword': {
    pt: 'Digite uma senha.',
    en: 'Enter a password.',
  },
  'authErr.wrongPassword': {
    pt: 'E-mail ou senha incorretos.',
    en: 'Wrong email or password.',
  },
  'authErr.userNotFound': {
    pt: 'Conta não encontrada.',
    en: 'Account not found.',
  },
  'authErr.tooManyRequests': {
    pt: 'Muitas tentativas. Tente novamente mais tarde.',
    en: 'Too many attempts. Try again later.',
  },
  'authErr.network': {
    pt: 'Sem conexão. Verifique sua internet.',
    en: 'No connection. Check your internet.',
  },
  'authErr.generic': {
    pt: 'Não foi possível concluir. Tente novamente.',
    en: "Couldn't complete. Please try again.",
  },

  // ---------- share ----------
  'share.line1': { pt: '🐱 Cat Match — Desafio {day}', en: '🐱 Cat Match — Challenge {day}' },
  'share.points': { pt: '{score} pontos {paws}', en: '{score} points {paws}' },
  'share.cta': { pt: 'Jogue você também! 🧶', en: 'Come play too! 🧶' },

  // ---------- periods ----------
  'period.week': { pt: 'Semana {n}', en: 'Week {n}' },

  // ---------- notifications ----------
  'notif.dailyBody': {
    pt: 'Os gatinhos sentem sua falta! Jogue o desafio diário e suba no ranking.',
    en: 'The kittens miss you! Play the daily challenge and climb the ranking.',
  },
};
