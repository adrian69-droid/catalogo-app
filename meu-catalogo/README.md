# Catálogo Interativo 2.0 — PokéAPI (Pokémon)

> **Projeto Somativo da Disciplina: Desenvolvimento Mobile Híbrido**  
> **Curso:** Bacharelado em Sistemas de Informação (BSI)  
> **Professor:** Mark Joselli  
> **Framework:** React Native com Expo (SDK 51)  

---

## 📱 Sobre o Projeto

O **Catálogo Interativo 2.0** é um aplicativo mobile híbrido desenvolvido em React Native com Expo que consome a [PokéAPI](https://pokeapi.co/), permitindo aos usuários:
- Autenticar-se localmente com armazenamento seguro (senhas com hash SHA-256).
- Navegar por uma grade de Pokémon com rolagem infinita e pull-to-refresh.
- Buscar Pokémon por nome com exibição em lista de resultados.
- Visualizar atributos detalhados (tipos, peso, altura, habilidades, descrição limpa).
- Favoritar e desfavoritar itens em tempo real com sincronização global (Context API).
- Registrar Pokémon como "capturados" (consumidos) atribuindo uma nota pessoal de 1 a 5 estrelas.
- Preservar todos os dados e o estado de sessão de forma persistente com `@react-native-async-storage/async-storage`.

---

## 🛠️ Tecnologias Utilizadas

- **React Native & Expo (SDK 51)**
- **React Navigation (`@react-navigation/native-stack`)**
- **Context API & Custom Hooks (`useAuth`, `useFavorites`, `useFetch`)**
- **Axios** para consumo da API REST
- **`@react-native-async-storage/async-storage`** para persistência local
- **`@expo/vector-icons` & `expo-font`** para iconografia
- **Segurança:** Algoritmo SHA-256 para hashing de credenciais locais

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18 ou superior).
- Dispositivo físico com o app **Expo Go** (Android/iOS) OU emulador configurado.

### Passos de Instalação e Execução

1. Clone ou baixe este repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd meu-catalogo
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor do Expo:
   ```bash
   npx expo start
   ```

4. No terminal, escaneie o QR Code com o aplicativo **Expo Go** (no Android) ou com a câmera (no iOS). Para rodar na web, pressione `w`.

---

## 🔑 Credenciais para Teste (Avaliador)

O aplicativo já vem pré-configurado com uma conta local de teste (com hash criptográfico SHA-256):

- **E-mail:** `admin@teste.com` (ou `ash@pokemon.com`)
- **Senha:** `1234`

> *Nota: Você também pode clicar na aba **"Cadastrar"** na tela inicial para criar qualquer outro usuário com a sua própria senha.*

---

## 📂 Estrutura de Pastas

```text
meu-catalogo/
├── App.js                     # Ponto de entrada, configuração de rotas e providers
├── app.json                   # Configurações do Expo
├── babel.config.js            # Configuração do Babel (preset expo)
├── package.json               # Dependências e scripts
└── src/
    ├── components/            # Componentes reutilizáveis
    │   └── ItemCard.js        # Card de item em grade com imagem, id, nome e favorito
    ├── contexts/              # Provedores de estado global
    │   ├── AuthContext.js     # Contexto de autenticação, sessão e hash
    │   └── FavoritesContext.js# Contexto de favoritos e itens capturados
    ├── hooks/                 # Hooks customizados
    │   ├── useAuth.js         # Acesso à sessão e auth
    │   ├── useFavorites.js    # Acesso aos favoritos e consumidos
    │   └── useFetch.js        # Hook de requisição reutilizável com loading/error/data
    ├── screens/               # Telas do aplicativo
    │   ├── LoginScreen.js     # Tela de login e cadastro com navegação condicional
    │   ├── CatalogScreen.js   # Tela principal (grade, busca, paginação, pull-to-refresh)
    │   ├── DetailsScreen.js   # Tela de detalhes, atributos, favorito e avaliação
    │   ├── SearchScreen.js    # Lista de resultados da busca
    │   ├── FavoritesScreen.js # Lista de itens favoritados
    │   └── ConsumedScreen.js  # Lista de itens capturados com notas (1-5 estrelas)
    ├── services/
    │   └── api.js             # Instância configurada do Axios (PokeAPI)
    └── utils/
        └── security.js        # Função de hash criptográfico SHA-256
```

---

## 📋 Tabela de Autoavaliação dos Requisitos Funcionais

| Requisito | Descrição | Status | Arquivo Principal |
| :--- | :--- | :---: | :--- |
| **RF01** | Catálogo com FlatList em grade, paginação infinita, pull-to-refresh e placeholders | **Implementado** | [`src/screens/CatalogScreen.js`](src/screens/CatalogScreen.js) / [`ItemCard.js`](src/components/ItemCard.js) |
| **RF02** | Navegação Stack Navigator, passagem de ID por params e header dinâmico | **Implementado** | [`App.js`](App.js) / [`src/screens/DetailsScreen.js`](src/screens/DetailsScreen.js) |
| **RF03** | Tela de detalhes com busca por ID, imagem grande, tipos, atributos e textos limpos | **Implementado** | [`src/screens/DetailsScreen.js`](src/screens/DetailsScreen.js) |
| **RF04** | Estado global de favoritos com Context API, hook `useFavorites()` e botão de coração | **Implementado** | [`src/contexts/FavoritesContext.js`](src/contexts/FavoritesContext.js) / [`src/hooks/useFavorites.js`](src/hooks/useFavorites.js) |
| **RF05** | Tela de favoritos com atualização em tempo real e `ListEmptyComponent` | **Implementado** | [`src/screens/FavoritesScreen.js`](src/screens/FavoritesScreen.js) |
| **RF06** | Persistência local (AsyncStorage) com carregamento seguro sem exibir dados zerados | **Implementado** | [`src/contexts/FavoritesContext.js`](src/contexts/FavoritesContext.js) / [`src/contexts/AuthContext.js`](src/contexts/AuthContext.js) |
| **RF07** | Login e cadastro local (senha em hash SHA-256), logout, sessão e consumidos com nota 1-5 | **Implementado** | [`src/screens/LoginScreen.js`](src/screens/LoginScreen.js) / [`src/screens/ConsumedScreen.js`](src/screens/ConsumedScreen.js) |
| **RF08** | Busca com TextInput controlado, botão "Buscar" e lista de resultados com estado vazio | **Implementado** | [`src/screens/CatalogScreen.js`](src/screens/CatalogScreen.js) / [`src/screens/SearchScreen.js`](src/screens/SearchScreen.js) |
| **RF09** | Feedback de UI: ActivityIndicator em todos os carregamentos e tratamento amigável de erro | **Implementado** | [`src/hooks/useFetch.js`](src/hooks/useFetch.js) / Todas as telas |
| **RF10** | Acessibilidade completa: labels, roles, states, áreas mínimas de toque e fontes escaláveis | **Implementado** | Todos os componentes e telas |
