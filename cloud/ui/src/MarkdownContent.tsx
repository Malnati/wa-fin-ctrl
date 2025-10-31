import React from "react";

type IntrinsicElement = keyof React.JSX.IntrinsicElements;

interface MarkdownContentProps {
  html?: string;
  text: string;
  component?: IntrinsicElement;
  className?: string;
  style?: React.CSSProperties;
  fallbackStyle?: React.CSSProperties;
}

const DEFAULT_COMPONENT: IntrinsicElement = "div";

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  html,
  text,
  component = DEFAULT_COMPONENT,
  className,
  style,
  fallbackStyle,
}) => {
  if (html !== undefined) {
    return React.createElement(component, {
      className,
      style,
      dangerouslySetInnerHTML: { __html: html },
    });
  }

  return React.createElement(
    component,
    {
      className,
      style: fallbackStyle ?? style,
    },
    text,
  );
};

export { MarkdownContent };
