import {Client, Events, Interaction} from "discord.js";

enum InteractionType {
    AUTOCOMPLETE = "AUTOCOMPLETE",
    BUTTON = "BUTTON",
    MESSAGE_CONTEXT_MENU = "MESSAGE_CONTEXT_MENU",
    USER_CONTEXT_MENU = "USER_CONTEXT_MENU",
    MODAL = "MODAL",
    PRIMARY_ENTRY_POINT = "PRIMARY_ENTRY_POINT",
    SELECT_MENU = "SELECT_MENU",
    SLASH = "SLASH",

}
type InteractionHandler = (...args: any[]) => any;
type InteractionMap = Record<string, InteractionHandler>
type Interactions = Record<InteractionType, InteractionMap>

export class InteractionsManager {

    private interactionMap: Interactions = {
        [InteractionType.AUTOCOMPLETE]: {},
        [InteractionType.BUTTON]: {},
        [InteractionType.MESSAGE_CONTEXT_MENU]: {},
        [InteractionType.USER_CONTEXT_MENU]: {},
        [InteractionType.MODAL]: {},
        [InteractionType.PRIMARY_ENTRY_POINT]: {},
        [InteractionType.SELECT_MENU]: {},
        [InteractionType.SLASH]: {},
    };
    private client: Client | null;
    private static instance: InteractionsManager | null;

    private constructor(client: Client) {
        this.client = client;
        this.initClient(this.client);
    }

    public static createInstance(client: Client): InteractionsManager {
        InteractionsManager.instance = new InteractionsManager(client);
        return InteractionsManager.instance;
    }

    private initClient(client: Client) {
        client.on(Events.InteractionCreate, async (interaction: Interaction) => {

            const info = this.getInteractionInfo(interaction);
            if(!info) throw new Error("Interaction info not found");
            const { type, identifier } = info;

            const map = this.interactionMap[type];
            if (map) {
                await this.handle(map, identifier, interaction);
            }
        })
    }

    private getInteractionInfo(interaction: Interaction): {type: InteractionType, identifier: string} | undefined {
        if (interaction.isCommand()){
            if(interaction.isChatInputCommand()) return { type: InteractionType.SLASH, identifier: interaction.commandName }
            if(interaction.isContextMenuCommand()){
                if(interaction.isMessageContextMenuCommand()) return { type: InteractionType.MESSAGE_CONTEXT_MENU, identifier: interaction.commandName }
                if(interaction.isUserContextMenuCommand()) return { type: InteractionType.USER_CONTEXT_MENU, identifier: interaction.commandName }
            }
            if (interaction.isPrimaryEntryPointCommand()) return { type: InteractionType.PRIMARY_ENTRY_POINT, identifier: interaction.commandName };
                return undefined
        }
        if(interaction.isMessageComponent()){
            if (interaction.isButton()) return { type: InteractionType.BUTTON, identifier: interaction.customId };
            if (interaction.isStringSelectMenu()) return { type: InteractionType.SELECT_MENU, identifier: interaction.customId };
            return undefined
        }
        if (interaction.isModalSubmit()) return { type: InteractionType.MODAL, identifier: interaction.customId };
        if (interaction.isAutocomplete()) return { type: InteractionType.AUTOCOMPLETE, identifier: interaction.commandName };

        return undefined
    }

    private async handle(interactionMap: InteractionMap, name: string, interaction: any) {
        const handler = interactionMap[name];

        if (!handler) {
            throw new Error(`No handler registered for "${name}"`);
        }

        await handler(interaction);
    }

    public register(type: InteractionType, interaction: { name: string; value: InteractionHandler }): boolean {
        return this._register(type, {key: interaction.name, value: interaction.value})
    }

    private createMap(name: string, func: (...args: any[]) => any): {key: string, value: InteractionHandler} {
        return {
            key: name,
            value: func
        };
    }
    private _register(type: InteractionType, interaction: { key: string; value: InteractionHandler }): boolean {
        if (Object.hasOwn(this.interactionMap[type], interaction.key)) {
            throw new Error(`Duplicate entry when registering ${type}`)
        }

        this.interactionMap[type][interaction.key] = interaction.value;
        return true;
    }

    public registerAutocomplete(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.AUTOCOMPLETE, this.createMap(name, func))
    }
    public registerButton(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.BUTTON, this.createMap(name, func))
    }
    public registerMessageContextMenus(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.MESSAGE_CONTEXT_MENU, this.createMap(name, func))
    }
    public registerUserContextMenus(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.USER_CONTEXT_MENU, this.createMap(name, func))
    }
    public registerModal(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.MODAL, this.createMap(name, func))
    }
    public registerPrimaryEntryPoint(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.PRIMARY_ENTRY_POINT, this.createMap(name, func))
    }
    public registerSelectMenu(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.SELECT_MENU, this.createMap(name, func))
    }
    public registerSlash(name: string, func: (...args: any[]) => any): boolean{
        return this._register(InteractionType.SLASH, this.createMap(name, func));
    }

}