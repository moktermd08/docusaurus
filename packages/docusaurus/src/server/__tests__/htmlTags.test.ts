/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {loadHtmlTags} from '../htmlTags';
import type {LoadedPlugin} from '@docusaurus/types';

const pluginEmpty: LoadedPlugin = {
  name: 'plugin-empty',
};

const pluginPreBodyTags: LoadedPlugin = {
  name: 'plugin-preBodyTags',
  injectHtmlTags() {
    return {
      preBodyTags: {
        tagName: 'script',
        attributes: {
          type: 'text/javascript',
          async: false,
        },
        innerHTML: 'window.foo = null;',
      },
    };
  },
};

const pluginHeadTags: LoadedPlugin = {
  name: 'plugin-headTags-only',
  injectHtmlTags() {
    return {
      headTags: [
        {
          tagName: 'link',
          attributes: {
            rel: 'preconnect',
            href: 'www.google-analytics.com',
          },
        },
        {
          tagName: 'meta',
          attributes: {
            name: 'generator',
            content: 'Docusaurus',
          },
        },
        {
          tagName: 'script',
          attributes: {
            type: 'text/javascript',
            src: 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
            async: true,
            'data-options': '{"prop":true}',
          },
        },
      ],
    };
  },
};

const pluginPostBodyTags: LoadedPlugin = {
  name: 'plugin-postBody-tags',
  injectHtmlTags() {
    return {
      postBodyTags: [
        {
          tagName: 'div',
          innerHTML: 'Test content',
        },
        '<script>window.alert(1);</script>',
      ],
    };
  },
};

const pluginMaybeInjectHeadTags: LoadedPlugin = {
  name: 'plugin-postBody-tags',
  injectHtmlTags() {
    return undefined;
  },
};

describe('loadHtmlTags', () => {
  it('works for an empty plugin', () => {
    const htmlTags = loadHtmlTags([pluginEmpty]);
    expect(htmlTags).toMatchInlineSnapshot(`
      {
        "headTags": "",
        "postBodyTags": "",
        "preBodyTags": "",
      }
    `);
  });

  it('only injects headTags', () => {
    const htmlTags = loadHtmlTags([pluginHeadTags]);
    expect(htmlTags).toMatchInlineSnapshot(`
      {
        "headTags": "<link rel="preconnect" href="www.google-analytics.com">
      <meta name="generator" content="Docusaurus">
      <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js" async data-options="{&quot;prop&quot;:true}"></script>",
        "postBodyTags": "",
        "preBodyTags": "",
      }
    `);
  });

  it('only injects preBodyTags', () => {
    const htmlTags = loadHtmlTags([pluginPreBodyTags]);
    expect(htmlTags).toMatchInlineSnapshot(`
      {
        "headTags": "",
        "postBodyTags": "",
        "preBodyTags": "<script type="text/javascript">window.foo = null;</script>",
      }
    `);
  });

  it('only injects postBodyTags', () => {
    const htmlTags = loadHtmlTags([pluginPostBodyTags]);
    expect(htmlTags).toMatchInlineSnapshot(`
      {
        "headTags": "",
        "postBodyTags": "<div>Test content</div>
      <script>window.alert(1);</script>",
        "preBodyTags": "",
      }
    `);
  });

  it('allows multiple plugins that inject different part of html tags', () => {
    const htmlTags = loadHtmlTags([
      pluginHeadTags,
      pluginPostBodyTags,
      pluginPreBodyTags,
    ]);
    expect(htmlTags).toMatchInlineSnapshot(`
      {
        "headTags": "<link rel="preconnect" href="www.google-analytics.com">
      <meta name="generator" content="Docusaurus">
      <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js" async data-options="{&quot;prop&quot;:true}"></script>",
        "postBodyTags": "<div>Test content</div>
      <script>window.alert(1);</script>",
        "preBodyTags": "<script type="text/javascript">window.foo = null;</script>",
      }
    `);
  });

  it('allows multiple plugins that might/might not inject html tags', () => {
    const htmlTags = loadHtmlTags([
      pluginEmpty,
      pluginHeadTags,
      pluginPostBodyTags,
      pluginMaybeInjectHeadTags,
    ]);
    expect(htmlTags).toMatchInlineSnapshot(`
      {
        "headTags": "<link rel="preconnect" href="www.google-analytics.com">
      <meta name="generator" content="Docusaurus">
      <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js" async data-options="{&quot;prop&quot;:true}"></script>",
        "postBodyTags": "<div>Test content</div>
      <script>window.alert(1);</script>",
        "preBodyTags": "",
      }
    `);
  });
  it('throws for invalid tag', () => {
    expect(() =>
      loadHtmlTags([
        {
          injectHtmlTags() {
            return {
              headTags: {
                tagName: 'endiliey',
                attributes: {
                  this: 'is invalid',
                },
              },
            };
          },
        },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Error loading {"tagName":"endiliey","attributes":{"this":"is invalid"}}, "endiliey" is not a valid HTML tag."`,
    );
  });

  it('throws for invalid tagName', () => {
    expect(() =>
      loadHtmlTags([
        {
          injectHtmlTags() {
            return {
              headTags: {
                tagName: true,
              },
            };
          },
        },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `"{"tagName":true} is not a valid HTML tag object. "tagName" must be defined as a string."`,
    );
  });

  it('throws for invalid tag object', () => {
    expect(() =>
      loadHtmlTags([
        {
          injectHtmlTags() {
            return {
              headTags: 2,
            };
          },
        },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `""2" is not a valid HTML tag object."`,
    );
  });
});
