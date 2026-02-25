# Discord Module System

Un système de modules ultra-simple et 100% typé TypeScript pour Discord.js

## 🚀 À quoi ça sert ?

Transformez votre bot Discord en modules indépendants activables/désactivables :

✨ Fonctionnalités principales

    🔗 Auto-binding : module.events → client.on() automatique

    🎯 Noms libres : handleMessage() ou myPingHandler() → vous choisissez !

    ⚡ Performant : Seulement les events déclarés sont bindés

    🔄 Hot reload : Activez/désactivez modules sans redémarrer

    Discordjs : Always up to date and completely compatible

```ts
const manager = new ModuleManager(client);
manager.register(new MusicModule(client));
manager.register(new AdminModule(client));
manager.enableAll();
```

## 🎮 Utilisation (2 minutes)
1. Module exemple
```ts
export class MusicModule extends Module {
    name = "Music";
    
    async playSong(interaction: Interaction) {
        interaction.reply("🎵 Musique démarrée !");
    }
    
    public get events() {
        return {
            interactionCreate: this.playSong  // ✅ Auto-bind !
        };
    }
}
```
2. Bot principal
```ts
client.once(Events.ClientReady, () => {
const manager = new ModuleManager(client);
manager.register(new MusicModule(client));
manager.enableAll(); // 🎉 Tout marche !
});
```

| Functionnalities    | Without Modules  | With Module   |
|---------------------|------------------|---------------|
| clean client.on     | ❌                | ✅             |
| Live module enabled | ❌ (Need restart) | ✅ (One click) |
| Organised           | ❌                | ✅             |