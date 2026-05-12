import {world,system} from "@minecraft/server"


const corrosionBlocks = [
    {

    }
]


function handleCorrosion(block,dimension){
    
}

system.beforeEvents.startup.subscribe((initEvent)=>{
    initEvent.blockComponentRegistry.registerCustomComponent('trmt:erosion',{
        onStepOn:e=>{
            const {block,entity,dimension} = e
            if(entity.typeId === 'minecraft:player'){
                handleCorrosion(block,dimension)
            }
        },
        onRandomTick:e=>{
            const {block,dimension} = e

        }
    })
})

