import { media, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const captureImageHelper = (file: media.File): string => {
  let content = '';
  let len = 20;
  if (file.content) {
    len = Math.min(len, file.content.length);
    content = file.content.substr(0, len);
  }
  const output =
    'format: ' + file.format + ', size: ' + file.size + ', mimeType: ' + file.mimeType + ', content: ' + content;

  return output;
};

const selectMediaHelper = (medias: media.Media[]): string => {
  let message = '';
  for (let i = 0; i < medias.length; i++) {
    const media: media.Media = medias[i];
    let preview = '';
    let len = 20;
    if (media.preview) {
      len = Math.min(len, media.preview.length);
      preview = media.preview.substr(0, len);
    }
    message +=
      '[format: ' +
      media.format +
      ', size: ' +
      media.size +
      ', mimeType: ' +
      media.mimeType +
      ', content: ' +
      media.content +
      ', preview: ' +
      preview +
      '],';
  }
  return message;
};

const CaptureImage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CaptureImage',
    title: 'Capture Image',
    onClick: {
      withPromise: async () => {
        const result = await media.captureImage();
        const output = captureImageHelper(result[0]);
        return output;
      },
      withCallback: setResult => {
        const callback = (error?: SdkError, files?: media.File[]): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else if (files) {
            const output = captureImageHelper(files[0]);
            setResult(output);
          } else {
            setResult('Unsuccessful capture');
          }
        };
        media.captureImage(callback);
        return 'media.captureImage()' + noHostSdkMsg;
      },
    },
  });

const SelectMedia = (): React.ReactElement =>
  ApiWithTextInput<media.MediaInputs>({
    name: 'selectMedia',
    title: 'Select Media',
    onClick: {
      validateInput: input => {
        if (!input.mediaType || !input.maxMediaCount) {
          throw new Error('mediaType and maxMediaCount are required');
        }
      },
      submit: {
        withPromise: async input => {
          const medias = await media.selectMedia(input);
          const output = selectMediaHelper(medias);
          return output;
        },
        withCallback: (input, setResult) => {
          const callback = (error: SdkError, medias: media.Media[]): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              const output = selectMediaHelper(medias);
              setResult(output);
            }
          };
          media.selectMedia(input, callback);
          return 'media.selectMedia()' + noHostSdkMsg;
        },
      },
    },
  });

const GetMedia = (): React.ReactElement =>
  ApiWithTextInput<media.MediaInputs>({
    name: 'getMedia',
    title: 'Get Media',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: async (input, setResult) => {
        const medias = await media.selectMedia(input);
        const mediaItem: media.Media = medias[0] as media.Media;
        const blob = await mediaItem.getMedia();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            setResult('Received Blob (length: ' + (reader.result as any).length + ')');
          }
        };
        return 'media.getMedia()' + noHostSdkMsg;
      },
    },
  });

const ViewImagesWithId = (): React.ReactElement =>
  ApiWithTextInput<media.MediaInputs>({
    name: 'viewImagesWithId',
    title: 'View Images With Id',
    onClick: {
      validateInput: input => {
        if (!input.mediaType || !input.maxMediaCount) {
          throw new Error('mediaType and maxMediaCount are required');
        }
      },
      submit: async input => {
        const medias = await media.selectMedia(input);

        const urlList: media.ImageUri[] = [];
        for (let i = 0; i < medias.length; i++) {
          const media = medias[i];
          urlList.push({
            value: media.content,
            type: 1, //ImageUriType.ID
          } as media.ImageUri);
        }
        await media.viewImages(urlList);
        return 'Success';
      },
    },
  });

const ScanBarCode = (): ReactElement =>
  ApiWithTextInput<media.BarCodeConfig>({
    name: 'mediaScanBarCode',
    title: 'Media Scan Bar Code',
    onClick: async input => {
      const result = await media.scanBarCode(input);
      return 'result: ' + result;
    },
  });

const ViewImagesWithUrls = (): React.ReactElement =>
  ApiWithTextInput<string[]>({
    name: 'viewImagesWithUrls',
    title: 'View Images With Urls',
    onClick: {
      validateInput: input => {
        if (!input || !Array.isArray(input) || input.length === 0 || input.find(x => typeof x !== 'string')) {
          throw new Error('input has to be an array of strings with at least one element');
        }
      },
      submit: async input => {
        const urlList: media.ImageUri[] = input.map(x => ({ value: x, type: 2 /* ImageUriType.ID */ }));
        await media.viewImages(urlList);
        return 'media.viewImagesWithUrls() executed';
      },
    },
  });

const CheckMediaCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMediaCapability',
    title: 'Check Media Call',
    onClick: async () => `Media module ${media.isSupported() ? 'is' : 'is not'} supported`,
  });

const MediaAPIs = (): ReactElement => (
  <>
    <h1>media</h1>
    <CaptureImage />
    <SelectMedia />
    <GetMedia />
    <ViewImagesWithId />
    <ViewImagesWithUrls />
    <ScanBarCode />
    <CheckMediaCapability />
  </>
);

export default MediaAPIs;
