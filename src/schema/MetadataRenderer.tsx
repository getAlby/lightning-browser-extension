import { MetadataValidator } from './metadataValidator';
import AudioObject from '~/app/components/Metadata/AudioObject';

export function MetadataRenderer(metadata: string | undefined) {
  if (metadata != undefined) {
    const metadataObject: object = JSON.parse(metadata);
    const isMetadataValid: boolean = MetadataValidator(metadataObject);
    if (isMetadataValid) {
      for (const [key, value] of Object.entries(metadataObject)) {
        if (key == "type") {
          if (value == "AudioObject") {
            return <AudioObject  {...metadataObject}></AudioObject>
          }
        }
      }
    } else {
      return <p>No valid Metadata Provided</p>;
    }
  } else {
     return <p>No Metadata Present</p>
  }

}

