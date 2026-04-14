import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule2 extends Module {
    public name: string = "Random2";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}