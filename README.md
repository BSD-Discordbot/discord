# BSD-discord


# Installations instructions

You muse have a [postgres](https://www.postgresql.org/) server installed
```bash
git clone https://github.com/Legonzaur/bsd-discordbot
cd bsd-discordbot
cp ./src/config.json.example ./src/config.json
```

edit the config.json file to match your settings 

```bash
npm i --omit=dev
npm i typescript
npm run build
npm run sync
npm run start
```