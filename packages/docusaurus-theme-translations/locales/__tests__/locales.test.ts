/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {jest} from '@jest/globals';
import {extractThemeCodeMessages} from '../../src/utils';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';

// Seems the 5s default timeout fails sometimes
jest.setTimeout(15000);

describe('theme translations', () => {
  it('has base messages files contain EXACTLY all the translations extracted from the theme. Please run "yarn workspace @docusaurus/theme-translations update" to keep base messages files up-to-date', async () => {
    const baseMessagesDirPath = path.join(__dirname, '../base');
    const baseMessages = await fs
      .readdir(baseMessagesDirPath)
      .then((files) =>
        Promise.all(
          files.map(
            (baseMessagesFile): Promise<{[key: string]: string}> =>
              fs.readJSON(path.join(baseMessagesDirPath, baseMessagesFile)),
          ),
        ),
      )
      .then((translations) =>
        Object.fromEntries(
          translations
            .map(Object.entries)
            .flat()
            .filter(([key]) => !key.endsWith('___DESCRIPTION')),
        ),
      );
    const codeMessages = _.mapValues(
      await extractThemeCodeMessages(),
      (translation) => translation.message,
    );

    expect(codeMessages).toEqual(baseMessages);
  });
});
