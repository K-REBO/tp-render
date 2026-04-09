// Templater の src/core/functions/internal_functions/date/InternalModuleDate.ts から移植
// `import { moment } from "obsidian"` → `import moment from "moment"` に変更のみ
import moment from "moment";

export function generate_now(): (
    format?: string,
    offset?: number | string,
    reference?: string,
    reference_format?: string
) => string {
    return (
        format = "YYYY-MM-DD",
        offset?: number | string,
        reference?: string,
        reference_format?: string
    ) => {
        if (reference && !moment(reference, reference_format).isValid()) {
            throw new Error(
                "Invalid reference date format, try specifying one with the argument 'reference_format'"
            );
        }
        let duration;
        if (typeof offset === "string") {
            duration = moment.duration(offset);
        } else if (typeof offset === "number") {
            duration = moment.duration(offset, "days");
        }
        return moment(reference, reference_format)
            .add(duration)
            .format(format);
    };
}

export function generate_tomorrow(): (format?: string) => string {
    return (format = "YYYY-MM-DD") => {
        return moment().add(1, "days").format(format);
    };
}

export function generate_weekday(): (
    format: string,
    weekday: number,
    reference?: string,
    reference_format?: string
) => string {
    return (
        format = "YYYY-MM-DD",
        weekday: number,
        reference?: string,
        reference_format?: string
    ) => {
        if (reference && !moment(reference, reference_format).isValid()) {
            throw new Error(
                "Invalid reference date format, try specifying one with the argument 'reference_format'"
            );
        }
        return moment(reference, reference_format)
            .weekday(weekday)
            .format(format);
    };
}

export function generate_yesterday(): (format?: string) => string {
    return (format = "YYYY-MM-DD") => {
        return moment().add(-1, "days").format(format);
    };
}
