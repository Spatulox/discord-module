import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule5 extends Module {
    public name: string = "Random5";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}