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

## 🎮 Utilisation (2 minutes)
1. Module exemple
```ts
    export class PongModule extends Module {
        public name: string = "Pong Module";
        public description: string = "Reply with pong";
        public get events(): ModuleEventsMap {
            return {
                [Events.MessageCreate]: this.handleMessage,
                [Events.MessageUpdate]: [this.handleMessageUpdate1, this.handleMessageUpdate2],
            }
        }
    
        async handleMessage(message: Message) {
            if(message.content == "!ping") {
                message.reply("Pong !")
            }
        }
    
        async handleMessageUpdate1(message: Message) {
            message.reply("Update 1 !")
        }
    
        async handleMessageUpdate2(message: Message) {
            message.reply("Update 2 !")
        }
    
    }
```
2. Bot principal
```ts
client.once(Events.ClientReady, () => {
    const manager = ModuleManager.createInstance(client); // ModuleManager is a singleton
    manager.register(new PongModule(client)); // You can register a Module or a MultiModule (Menu for Module)
    manager.enableAll(); // By default, a Module is disable
    manager.sendUIToChannel("channelID") // Optionnal, only if you want to dynamically toggle modules
});
```

| Functionnalities    | Without Modules  | With Module   |
|---------------------|------------------|---------------|
| clean client.on     | ❌                | ✅             |
| Live module enabled | ❌ (Need restart) | ✅ (One click) |
| Organised           | ❌                | ✅             |