import { EL_ATTR_NAME } from './constant';
import {
  ElementAppliedCSS,
  ElementCSSRule,
  ElementMediaCSSRule,
  cssTextToObject,
  extractCSSText,
  getAppliedCSSProperties,
  parseCSSStyleRule,
} from './css-rule-parser';
import type { SetRequired } from 'type-fest';
import {
  isExpectedStyleAccessError,
  reportUnexpectedStyleError,
} from './browser-errors';

const MAX_RULES_CACHE_MS = 60_000; // 1 minute

export interface ElementAppliedStyleRules extends ElementAppliedCSS {
  animation: AnimationKeyframeRule[];
  media: SetRequired<ElementAppliedCSS, 'mediaCondition'>[];
}

export type AnimationKeyframeRule = Pick<
  CSSKeyframesRule,
  'name' | 'cssText'
> & { isDirty?: boolean };
export type AnimationKeyframeRuleRecord = Record<string, AnimationKeyframeRule>;

class CSSRulesUtils {
  private lastRetrievedRules: null | number = null;

  private _rules: (CSSMediaRule | CSSStyleRule)[] = [];
  private _keyframeRules: AnimationKeyframeRuleRecord = {};

  constructor() {}

  get rules() {
    if (
      !this.lastRetrievedRules ||
      Date.now() - this.lastRetrievedRules >= MAX_RULES_CACHE_MS
    ) {
      this._rules = [];
      this._keyframeRules = {};

      const excludeStyleEl = (
        ownerNode: Element | ProcessingInstruction | null,
      ) => {
        if (!(ownerNode instanceof HTMLElement)) return false;

        return (
          ownerNode.id === 'inspect-css-style' ||
          ownerNode.hasAttribute(EL_ATTR_NAME.customStyle)
        );
      };

      for (const styleSheet of document.styleSheets) {
        let cssRules: CSSRuleList;
        try {
          if (styleSheet.disabled || excludeStyleEl(styleSheet.ownerNode))
            continue;

          cssRules = styleSheet.cssRules;
        } catch (error) {
          // Cross-origin stylesheets are expected to reject cssRules access.
          if (!isExpectedStyleAccessError(error))
            reportUnexpectedStyleError(
              'Could not read a stylesheet; skipping it.',
              error,
            );
          continue;
        }

        for (const rule of cssRules) {
          try {
            if (rule instanceof CSSKeyframesRule) {
              this._keyframeRules[rule.name] = {
                name: rule.name,
                cssText: extractCSSText(rule.cssText),
              };
            } else if (
              rule instanceof CSSStyleRule ||
              rule instanceof CSSMediaRule
            ) {
              this._rules.push(rule);
            }
          } catch (error) {
            reportUnexpectedStyleError(
              'Could not read a CSS rule; skipping it.',
              error,
            );
          }
        }
      }

      this.lastRetrievedRules = Date.now();
    }

    return this._rules;
  }

  getAppliedRules(element: Element): ElementAppliedStyleRules {
    const rules: ElementCSSRule[] = [];
    const mediaRules: ElementMediaCSSRule[] = [];
    const animationRules: AnimationKeyframeRule[] = [];

    const mediaIndexMap = new Map<string, number>();

    for (const rule of this.rules) {
      let result: ElementMediaCSSRule;
      try {
        result = parseCSSStyleRule(element, rule);
      } catch (error) {
        reportUnexpectedStyleError(
          'Could not parse a CSS rule for the selected element; skipping it.',
          error,
        );
        continue;
      }

      if (result.mediaCondition) {
        if (result.rules.length <= 0) continue;

        const mediaIndex = mediaIndexMap.get(result.mediaCondition);
        if (typeof mediaIndex === 'number') {
          mediaRules[mediaIndex].rules.push(...result.rules);
        } else {
          mediaRules.push(result);
        }

        mediaIndexMap.set(result.mediaCondition, mediaRules.length - 1);
      } else {
        rules.push(...result.rules);
      }
    }

    const inlineStyle = element.getAttribute('style');
    if (inlineStyle) {
      rules.push({
        selector: '',
        specificity: 1000,
        cssText: inlineStyle,
        properties: cssTextToObject(inlineStyle),
      });
    }

    const sortedRules = rules.sort((a, b) =>
      a.specificity > b.specificity ? -1 : 1,
    );
    const mainRules = getAppliedCSSProperties(
      element,
      sortedRules,
      this._keyframeRules,
    );
    animationRules.push(...mainRules.animation);

    const appliedMediaCSS = mediaRules.map((mediaRule) => {
      const sortedMediaRules = mediaRule.rules.sort((a, b) =>
        a.specificity > b.specificity ? -1 : 1,
      );

      return getAppliedCSSProperties(
        element,
        sortedMediaRules,
        this._keyframeRules,
        mediaRule.mediaCondition,
      ) as SetRequired<ElementAppliedCSS, 'mediaCondition'>;
    });

    return {
      ...mainRules,
      animation: animationRules,
      media: appliedMediaCSS.reverse(),
    };
  }

  destroy() {
    this._rules = [];
    this._keyframeRules = {};
    this.lastRetrievedRules = null;
  }
}

export default CSSRulesUtils;
