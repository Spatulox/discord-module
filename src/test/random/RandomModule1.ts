import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule1 extends Module {
    public name: string = "Random1";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}