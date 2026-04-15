module.exports = class Model {
    static fromJson(type, json) {
        const instance = new type();
        const properties = Object.getOwnPropertyNames(instance);
        for (const property of properties) {
            if (!json.hasOwnProperty(property)) continue;

            if (typeof(json[property]) == "bigint") {
                instance[property] = Number(json[property]);
            } else {
                instance[property] = json[property];
            }
        }
    
        return instance;
    }

    getSqlCreate() {
        let query = "(";
        const keys = Object.keys(this);
        const values = Object.values(this);

        for (let i = 0; i < keys.length; i++) {
            if (typeof(values[i]) == "string") {
                query += `"${values[i]}"`;
            } else if (values[i] && typeof(values[i]) == "object") {
                query += `"${JSON.stringify(values[i]).replace(/\"/g, "\\\"").replace(/\'/g, "\\\'")}"`
            } else {
                query += `${values[i]}`;
            }

            if (i+1 < keys.length) {
                query += ",";
            }
        }

        query += ")";

        return query;
    }

    getSqlUpdate() {
        let query = "";
        const keys = Object.keys(this);
        const values = Object.values(this);

        for (let i = 0; i < keys.length; i++) {
            if (typeof(values[i]) == "string") {
                query += `${keys[i]}="${values[i]}"`; 
            } else if (typeof(values[i] == "object")) {
                query += `${keys[i]}="${JSON.stringify(values[i]).replace(/\"/g, "\\\"").replace(/\'/g, "\\\'")}"`;
            } else {
                query += `${keys[i]}=${values[i]}`;    
            }

            if (i+1 < keys.length) {
                query += ",";
            }
        }

        return query;
    }
}