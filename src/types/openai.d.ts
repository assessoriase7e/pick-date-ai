export type ToolFunction = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: {
      type: "object";
      properties: Record<string, JSONSchemaProperty>;
      required?: string[];
    };
  };
};

export type JSONSchemaProperty = {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty; // for array types
  properties?: Record<string, JSONSchemaProperty>; // for object types
  required?: string[];
};
