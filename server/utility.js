import fs from "node:fs/promises";

export const GenGraph = async (agent, filePath) => {
    const drawableGraph = await agent.getGraphAsync();
    const image = await drawableGraph.drawMermaidPng();
    const imageBuffer = new Uint8Array(await image.arrayBuffer());

    await fs.writeFile(filePath, imageBuffer);
}