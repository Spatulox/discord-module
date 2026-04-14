import {
    ActionRowBuilder,
    ButtonBuilder, ButtonInteraction,
    ButtonStyle,
    Client,
    ContainerBuilder,
    Message,
    MessageFlags,
    SectionBuilder,
    SendableChannels,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder
} from "discord.js";
import {Module} from "./Module";
import {MultiModule} from "./MultiModule";
import {ModuleRegistry} from "./ModuleRegistry";
import {InteractionMatchType, InteractionsManager} from "./InteractionsManager";
import * as fs from "node:fs";
import path from "node:path";

type TrucBidule = MultiModule | Module | "root"
type DynamicPage = Record<number, SectionBuilder[]>

export class ModuleUI {

    private client: Client;
    private channel_id: string;
    private message_id: string | null = null;
    private channel: SendableChannels | null = null;
    private message: Message | null = null
    //private static message: Message | null = null;
    private targetedModuleName: string | "root" = "root"
    private currentModule: string | "root" = "init"
    private readonly CACHE_DIR = ".dmcache";
    private readonly MAX_COMPONENT_PER_PAGE = 40
    private dynamicPage: DynamicPage = {}
    private pageIndex: number = 0

    constructor(client: Client, channel_id: string) {
        this.client = client;
        this.channel_id = channel_id;
        this.setup()
    }

    private async setup() {
        await this.initCache(null)
        await this.registerButtons()
        await this.fetchChannel()
        await this.fetchMessageById();
        await this.sendUI()
    }

    private async registerButtons(): Promise<void> {
        console.log("Register buttons")
        const interactionManager = InteractionsManager.createOrGetInstance(this.client);
        interactionManager.registerButton("dm_prev", (interaction: ButtonInteraction) => {
            this.changePageIndex(interaction, this.pageIndex - 1)
        })
        interactionManager.registerButton("dm_next", (interaction: ButtonInteraction) => {
            console.log("Eoué on passe içi")
            this.changePageIndex(interaction, this.pageIndex + 1)
        })
        interactionManager.registerButton("dm_go_back", (_interaction: ButtonInteraction) => {})
        interactionManager.registerButton("toggle_", (_interaction: ButtonInteraction) => {}, InteractionMatchType.START_WITH)
    }

    private async changePageIndex(interaction: ButtonInteraction, newIndex: number) {
        this.pageIndex = newIndex;
        console.log("Page index", this.pageIndex);
        await this.updateUI()
        interaction.deferUpdate()
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
        try {
            const channel = await this.client.channels.fetch(this.channel_id);

            if (!channel || !channel?.isTextBased() || !channel?.isSendable()) {
                throw new Error("Channel not found or not text-based");
            }
            this.channel = channel
        } catch (e) {
            console.error(e)
        }
    }

    private async fetchMessageById(): Promise<void> {
        try {
            if (!this.message_id) return
            this.message = await this.channel?.messages.fetch(this.message_id) ?? null
        } catch (e) {
            console.error(`The original message haven't been found, it may have been deleted : ${e}`)
        }
    }

    private getTargetedModule(): TrucBidule {
        const mod = ModuleRegistry.getModule(this.targetedModuleName)
        return mod ?? "root"
    }

    private createUI(): (ContainerBuilder | ActionRowBuilder<ButtonBuilder>)[]{
        const multi = this.getTargetedModule()
        if (!multi) {
            throw new Error("Impossible to render the targeted Module : Module is not a MultiModule")
        }
        const container = new ContainerBuilder()
        this.createHeaderContainer(container)
        const footer = this.createFooterbuttonRow() // Here it's used to determine the number of component
        const maxComponents = this.MAX_COMPONENT_PER_PAGE - this.countComponents([container, footer])

        if(this.currentModule !== this.targetedModuleName) {
            // Header and Footer need to be determined before creating the dynamic main UI
            this.dynamicPage = this.createDynamicUI(container, multi, maxComponents)
        }

        const newFooter = this.createFooterbuttonRow()

        const page = this.dynamicPage[this.pageIndex];
        if (!page) return [container, newFooter]

        for (const comp of page) {
            container.addSectionComponents(comp);
        }
        this.currentModule = this.targetedModuleName
        return [container, newFooter]
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
    private createDynamicUI(_container: ContainerBuilder, multiMod: TrucBidule, maxComponent: number): DynamicPage {
        if (multiMod instanceof MultiModule) {
            return this.buildDynamicPage(multiMod.subModules, maxComponent);
        }

        const root = ModuleRegistry.getRoot() ?? [];
        return this.buildDynamicPage(root, maxComponent);
    }

    // 4 component
    private createFooterbuttonRow(): ActionRowBuilder<ButtonBuilder> {
        const action = new ActionRowBuilder<ButtonBuilder>()

        const numberPage = Object.keys(this.dynamicPage).length

        action.addComponents(new ButtonBuilder()
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("dm_prev")
            .setDisabled(this.pageIndex <= 0)
        )

        action.addComponents(new ButtonBuilder()
            .setLabel(`Page ${this.pageIndex+1}/${numberPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("dm_page")
            .setDisabled(true)
        )

        action.addComponents(new ButtonBuilder()
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("dm_next")
            .setDisabled(this.pageIndex+1 >= numberPage)
        )

        action.addComponents(new ButtonBuilder()
            .setLabel("Back")
            .setStyle(ButtonStyle.Danger)
            .setCustomId("dm_go_back")
            .setDisabled(this.targetedModuleName === "root")
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


    private buildDynamicPage(
        modules: Module[],
        maxComponent: number
    ): DynamicPage {
        const dynamicPage: DynamicPage = {};
        let pageNumber = 0;
        let components: SectionBuilder[] = [];
        let count = 0;

        /**
         * For to avoid more than 40 component in a message, based on the number of component in header and footer
         */
        for (const module of modules) {
            const comp = module.createModuleUI();
            const compCount = this.countComponents([comp])
            if (count + compCount >= maxComponent) {
                dynamicPage[pageNumber] = components;
                pageNumber++;
                components = [];
                count = 0;
            }
            components.push(comp);
            count += compCount;
        }

        // reste éventuel
        if (components.length > 0) {
            dynamicPage[pageNumber] = components;
        }

        return dynamicPage;
    }

    /*private printAllComponents(components: any[], indent = ""): void {
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
    }*/
}