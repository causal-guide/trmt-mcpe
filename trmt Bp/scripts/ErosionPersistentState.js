import { world } from "@minecraft/server";

const DATA_KEY = "trmt_erosion";

export class ErosionPersistentState {

    constructor(data = {}) {
        this.data = data;
    }

    static getOrCreate() {

        const raw = world.getDynamicProperty(DATA_KEY);

        if (!raw) {
            return new ErosionPersistentState();
        }

        try {
            return new ErosionPersistentState(
                JSON.parse(raw)
            );
        } catch (e) {

            console.warn(
                `[TRMT] Failed loading erosion db: ${e}`
            );

            return new ErosionPersistentState();
        }
    }

    save() {

        world.setDynamicProperty(
            DATA_KEY,
            JSON.stringify(this.data)
        );
    }

    // ------------------------------------------------------------------------
    // Dimension
    // ------------------------------------------------------------------------

    getDimensionMap(dimensionId) {

        if (!this.data[dimensionId]) {
            this.data[dimensionId] = {};
        }

        return this.data[dimensionId];
    }

    // ------------------------------------------------------------------------
    // Chunk Maps
    // ------------------------------------------------------------------------

    getChunkMap(dimensionId, chunkPos) {

        const dimensionMap =
            this.getDimensionMap(dimensionId);

        return dimensionMap[
            this.#chunkKey(chunkPos)
        ];
    }

    computeChunkMap(dimensionId, chunkPos) {

        const dimensionMap =
            this.getDimensionMap(dimensionId);

        const key = this.#chunkKey(chunkPos);

        if (!dimensionMap[key]) {
            dimensionMap[key] = {};
        }

        return dimensionMap[key];
    }

    removeChunkMapIfEmpty(dimensionId, chunkPos) {

        const dimensionMap =
            this.getDimensionMap(dimensionId);

        const key = this.#chunkKey(chunkPos);

        const map = dimensionMap[key];

        if (map && Object.keys(map).length === 0) {
            delete dimensionMap[key];
        }
    }

    // ------------------------------------------------------------------------
    // Entries
    // ------------------------------------------------------------------------

    getEntry(dimensionId, blockPos) {

        const chunkPos =
            this.#toChunkPos(blockPos);

        const chunkMap =
            this.getChunkMap(dimensionId, chunkPos);

        if (!chunkMap) {
            return undefined;
        }

        return chunkMap[
            this.#blockKey(blockPos)
        ];
    }

    putEntry(dimensionId, blockPos, erosionEntry) {

        const chunkPos =
            this.#toChunkPos(blockPos);

        const chunkMap =
            this.computeChunkMap(
                dimensionId,
                chunkPos
            );

        chunkMap[
            this.#blockKey(blockPos)
        ] = erosionEntry;
    }

    removeEntry(dimensionId, blockPos) {

        const chunkPos =
            this.#toChunkPos(blockPos);

        const chunkMap =
            this.getChunkMap(
                dimensionId,
                chunkPos
            );

        if (!chunkMap) {
            return;
        }

        delete chunkMap[
            this.#blockKey(blockPos)
        ];

        this.removeChunkMapIfEmpty(
            dimensionId,
            chunkPos
        );
    }

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    #chunkKey(chunkPos) {
        return `${chunkPos.x},${chunkPos.z}`;
    }

    #blockKey(blockPos) {
        return `${blockPos.x},${blockPos.y},${blockPos.z}`;
    }

    #toChunkPos(pos) {

        return {
            x: Math.floor(pos.x / 16),
            z: Math.floor(pos.z / 16)
        };
    }
}