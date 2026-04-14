import {
    ActionRowBuilder, ButtonBuilder,
    ButtonStyle,
    Client,
    ContainerBuilder, Events, Message,
    MessageFlags, SendableChannels,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder
} from "discord.js";
import {Module} from "./Module";
import {MultiModule} from "./MultiModule";
import {ModuleRegistry} from "./ModuleRegistry";
import {InteractionsManager} from "./InteractionsManager";
import * as fs from "node:fs";
import path from "node:path";

type TrucBidule = MultiModule | Module | "root"

export class ModuleUI {

    private client: Client;
    private channel_id: string;
    private message_id: string | null = null;
    private channel: SendableChannels | null = null;
    private message: Message | null = null
    //private static message: Message | null = null;
    private targetedModuleName: "root" = "root"
    private page: number = 1;
    private readonly CACHE_DIR = ".dmcache";
    private MAX_COMPONENT_PER_PAGE = 40
    private MAX_COMPONENT_PER_PAGE_BKP = 40

    constructor(client: Client, channel_id: string) {
        this.client = client;
        this.channel_id = channel_id;
        this.setup()
        this.client.once(Events.ClientReady, () => {
            const interactionManager = InteractionsManager.createInstance(client);
            interactionManager.registerButton("dm_prev", this.next)
            interactionManager.registerButton("dm_page", this.next)
            interactionManager.registerButton("dm_next", this.next)
        })
    }

    private async setup() {
        await this.initCache(null)
        await this.fetchChannel()
        await this.fetchMessageById();
        await this.sendUI()
    }

    private next() {
    }

    private async initCache(message: Message | null): Promise<void> {
        if (!fs.existsSync(this.CACHE_DIR)) {
            fs.mkdirSync(this.CACHE_DIR, {recursive: true});
        }

        const fileName = `discord-modules.cache.json`;
        const filePath = path.join(this.CACHE_DIR, fileName);

        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, "utf-8");
                const cache = JSON.parse(raw);

                if (
                    typeof cache === "object" &&
                    cache.channel_id === this.channel_id &&
                    typeof cache.message_id === "string"
                ) {
                    this.message_id = cache.message_id
                    return
                }
            } catch (err) {
                console.log(err)
                return
            }
        }

        const cacheData = {
            channel_id: this.channel_id,
            message_id: message?.id ?? this.message?.id ?? null
        };
        this.message = message
        this.message_id = message?.id ?? null

        fs.writeFileSync(filePath, JSON.stringify(cacheData, null, 2));
    }

    private async fetchChannel() {
        const channel = await this.client.channels.fetch(this.channel_id);

        if (!channel || !channel?.isTextBased() || !channel?.isSendable()) {
            throw new Error("Channel not found or not text-based");
        }
        this.channel = channel
    }

    private async fetchMessageById(): Promise<void> {
        if (!this.message_id) return
        this.message = await this.channel?.messages.fetch(this.message_id) ?? null
    }

    private getTargetedModule(): TrucBidule {
        const mod = ModuleRegistry.getModule(this.targetedModuleName)
        return mod ?? this.targetedModuleName
    }

    private createUI(): (ContainerBuilder | ActionRowBuilder<ButtonBuilder>)[] {
        const multi = this.getTargetedModule()
        if (!multi) {
            throw new Error("Impossible to render the targeted Module : Module is not a MultiModule")
        }
        const container = new ContainerBuilder()
        this.createHeaderContainer(container)
        const footer = this.createFooterbuttonRow()
        this.MAX_COMPONENT_PER_PAGE = this.MAX_COMPONENT_PER_PAGE - this.countComponents([container.toJSON(), this.createFooterbuttonRow()])

        // Header and Footer neeed to be determined before creating the dynamic main UI
        this.createDynamicUI(container, multi)

        // Reset the MAX_COMPONENT_PER_PAGE private var
        this.MAX_COMPONENT_PER_PAGE = this.MAX_COMPONENT_PER_PAGE_BKP

        return [container, footer]
    }

    // 4 components
    private createHeaderContainer(container: ContainerBuilder) {
        container
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Module Manager`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`You can enable/disable any module`))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
    }

    //private createFooterContainer(container: ContainerBuilder){}
    // 32 component max
    private createDynamicUI(container: ContainerBuilder, multiMod: TrucBidule) {

        let count = 0
        if (multiMod instanceof MultiModule) {
            for (const module of multiMod.subModules) {
                const comp = module.createModuleUI()
                container.addSectionComponents(comp);
                count += this.countComponents([comp])
                if(count >= this.MAX_COMPONENT_PER_PAGE){
                    return
                }
            }
            return
        }

        const root = ModuleRegistry.getRoot() ?? []
        for (const module of root) {
            const comp = module.createModuleUI()
            container.addSectionComponents(comp);
            count += this.countComponents([comp])
            if(count >= this.MAX_COMPONENT_PER_PAGE){
                return
            }
        }

        if (multiMod instanceof Module) {
            container.addSectionComponents(multiMod.createModuleUI());
            return
        }
    }

    // 4 component
    private createFooterbuttonRow(): ActionRowBuilder<ButtonBuilder> {
        const action = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("dm_prev"),
                new ButtonBuilder()
                    .setLabel(`Page ${this.page}/${this.page}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("dm_page"),
                new ButtonBuilder()
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("dm_next")
            )
        return action
    }

    private countComponents(components: any[]): number {
        return components.reduce((sum, c) => {
            let n = 1;
            if (c.components && Array.isArray(c.components)) {
                n += this.countComponents(c.components);
            }
            if (c.accessory) {
                n += 1
            }
            return sum + n;
        }, 0);
    }

    private async updateUI() {
        this.message?.edit({
            components: this.createUI()
        })
    }

    private async sendUI() {
        const channel = this.channel
        if (!channel) {
            return
        }
        if (this.message) {
            this.updateUI()
            return
        }
        if (channel.isTextBased() && channel.isSendable()) {
            const message = await channel.send({
                components: this.createUI(),
                flags: MessageFlags.IsComponentsV2
            })
            this.initCache(message)
            return
        }
        throw new Error(`Channel (${this.channel_id}) does not exist or is not a valid sendable channel`);
    }











    private printAllComponents(components: any[], indent = ""): void {
        for (const c of components) {
            // Affiche le type et quelques infos simples
            let desc = `<unknown>`;

            if (c.type === 10) {
                desc = `TextDisplay("${c.content?.substring(0, 50) ?? ""}...")`;
            } else if (c.type === 14) {
                desc = `Separator(divider=${c.divider}, spacing=${c.spacing})`;
            } else if (c.type === 9) {
                desc = `Section`;
            } else if (c.type === 2) {
                desc = `Button("${c.label}" | id="${c.custom_id ?? c.customId}")`;
            } else {
                desc = `Type${c.type ?? "???"}`;
            }

            console.log(indent + desc);

            if (c.components && Array.isArray(c.components)) {
                this.printAllComponents(c.components, indent + "  ");
            }
            if (c.accessory) {
                let desc = `Accessory(${c.accessory.label})`;
                console.log(indent + "  " + desc);
            }
        }
    }
}