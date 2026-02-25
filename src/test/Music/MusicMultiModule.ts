import {MultiModule, Module} from "../../index";
import {PlayModule} from "./PlayModule";
import {VolumeModule} from "./VolumeModule";

export class MusicMultiModule extends MultiModule {
    name = "Music";
    description = "🎵 Système de musique complet";

    protected get subModules(): Module[] {
        return [
            new PlayModule(),
            new VolumeModule(),
        ];
    }

}