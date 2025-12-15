import dayjs from "dayjs";

class DayJsUtil {
    constructor() {
        throw new Error("Constructor is not valid");
    }

    static now() {
        return dayjs();
    }

    static currentYear() {
        return dayjs().format("YYYY");
    }
}

export default DayJsUtil;