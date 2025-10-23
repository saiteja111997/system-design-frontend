import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeConfigField, ConfigSelectOption } from "@/types/workflow-studio";
import { ConfigurationFormProps } from "@/types/workflow-studio/sidebar-right";

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  configurations,
  values,
  onChange,
}) => {
  const renderField = (field: NodeConfigField) => {
    const value = values[field.key] ?? field.defaultValue;

    switch (field.type) {
      case "number":
        return (
          <div key={field.key} className="space-y-2">
            <label
              htmlFor={field.key}
              className="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {field.label} {field.unit && `(${field.unit})`}
            </label>
            <Input
              id={field.key}
              type="number"
              value={value as number}
              min={field.min}
              max={field.max}
              onChange={(e) =>
                onChange(
                  field.key,
                  parseFloat(e.target.value) || (field.defaultValue as number)
                )
              }
              className="w-full"
            />
          </div>
        );

      case "text":
        return (
          <div key={field.key} className="space-y-2">
            <label
              htmlFor={field.key}
              className="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {field.label}
            </label>
            <Input
              id={field.key}
              type="text"
              value={value as string}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.key} className="space-y-2">
            <label
              htmlFor={field.key}
              className="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {field.label}
            </label>
            <Select
              value={value as string}
              onValueChange={(newValue) => onChange(field.key, newValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: ConfigSelectOption) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "boolean":
        return (
          <div key={field.key} className="flex items-center space-x-2">
            <input
              id={field.key}
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onChange(field.key, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={field.key}
              className="text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              {field.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2">
        Configuration
      </h4>
      <div className="space-y-4">
        {Object.values(configurations).map(renderField)}
      </div>
    </div>
  );
};

export default ConfigurationForm;
