import React from "react";
import { GlowType } from "@/types/workflow-editor/workflow";
import {
  GlowWrapperProps,
  DatabaseGlowWrapperProps,
} from "@/types/workflow-editor/components";
import { getNodeGlowConfig } from "@/utils/stylingUtils";
import "@/styles/workflowAnimations.css";

/**
 * Generic wrapper component that applies glow effects to children
 * Uses composition pattern for better flexibility
 */
export const GlowWrapper: React.FC<GlowWrapperProps> = ({
  children,
  glowType,
  className = "",
  enabled = true,
}) => {
  const glowConfig = getNodeGlowConfig(glowType);

  // Only apply glow if enabled and glow type is not NONE
  const shouldApplyGlow = enabled && glowType !== GlowType.NONE;
  const glowClassName = shouldApplyGlow ? glowConfig.className : "";

  const combinedClassName = [className, glowClassName]
    .filter(Boolean)
    .join(" ");

  return <div className={combinedClassName}>{children}</div>;
};

/**
 * Higher-order component version for more advanced usage
 */
export const withGlow = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  glowType: GlowType,
  enabled: boolean = true
) => {
  const GlowEnhancedComponent = (props: P) => (
    <GlowWrapper glowType={glowType} enabled={enabled}>
      <WrappedComponent {...props} />
    </GlowWrapper>
  );

  GlowEnhancedComponent.displayName = `withGlow(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return GlowEnhancedComponent;
};

/**
 * Specialized Database glow wrapper
 */

export const DatabaseGlowWrapper: React.FC<DatabaseGlowWrapperProps> = ({
  children,
  glowType,
  className = "",
}) => {
  return (
    <GlowWrapper glowType={glowType} className={className} enabled={true}>
      {children}
    </GlowWrapper>
  );
};
