#! /usr/bin/env yarn jest

import { DiscreteBarChart } from "./DiscreteBarChart"
import { SynthesizeOwidTable } from "coreTable/OwidTable"
import { DiscreteBarChartOptionsProvider } from "./DiscreteBarChartConstants"

describe(DiscreteBarChart, () => {
    const table = SynthesizeOwidTable({ timeRange: [2000, 2010] })

    const options: DiscreteBarChartOptionsProvider = {
        table,
        yColumn: table.get("Population"),
    }

    it("can create a new bar chart", () => {
        const chart = new DiscreteBarChart({ options })

        expect(chart.failMessage).toBeTruthy()
        table.selectAll()
        expect(chart.failMessage).toEqual("")

        const marks = chart.marks
        expect(marks.length).toEqual(2)
        expect(marks[0].time).toBeTruthy()
    })
})
