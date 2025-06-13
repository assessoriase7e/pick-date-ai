import { Node, mergeAttributes } from "@tiptap/core";

export interface VariableOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variable: {
      insertVariable: (variable: { value: string; label: string }) => ReturnType;
    };
  }
}

export const Variable = Node.create<VariableOptions>({
  name: "variable",

  inline: true,
  group: "inline",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      value: {
        default: "",
      },
      label: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-variable]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        { "data-variable": HTMLAttributes.value, class: "badge-variable" },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `${HTMLAttributes.label}`,
    ];
  },

  addCommands() {
    return {
      insertVariable:
        (variable) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: variable,
          });
        },
    };
  },
});
