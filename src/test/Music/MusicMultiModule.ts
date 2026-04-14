import {MultiModule, Module} from "../../index";
import {PlayModule} from "./PlayModule";
import {VolumeModule} from "./VolumeModule";
import {RandomModule7} from "../random/RandomModule7";

export class MusicMultiModule extends MultiModule {
    name = "Music Multi Module";
    description = "🎵 Système de musique complet";

    public subModules: Module[] = [
        new PlayModule(),
        new VolumeModule(),
        new RandomModule7()
    ];
}