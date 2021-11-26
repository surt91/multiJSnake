# Strip information unecessary for inference from the model
# this avoids problems with, e.g., custom objects in the model
# and also reduces the size of the file.
# However, the result can not be used to continue training.

import sys

from tensorflow import keras

if len(sys.argv) < 2:
    print("expect the name of the file as input")
    sys.exit(1)

filename = sys.argv[1]

model = keras.models.load_model(filename, compile=False)
model.save(filename)
