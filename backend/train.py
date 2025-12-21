import os
import json
import tensorflow as tf
from pathlib import Path
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

# Configuration
BATCH_SIZE = 8
IMG_SIZE = (160, 160)
EPOCHS = 1
LEARNING_RATE = 0.0001
DATA_DIR = Path("datasets/processed_v2")
MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

def train_model():
    print(f"TensorFlow Version: {tf.__version__}")
    print(f"Checking data directory: {DATA_DIR.absolute()}")
    
    if not DATA_DIR.exists():
        print(f"Error: Data directory {DATA_DIR} not found!")
        return

    # Load Datasets
    print("Loading datasets...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "train",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "val",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )

    # Save Class Indices
    class_names = train_ds.class_names
    print(f"Found {len(class_names)} classes: {class_names}")
    
    class_indices = {name: i for i, name in enumerate(class_names)}
    with open(MODELS_DIR / "class_indices.json", "w") as f:
        json.dump(class_indices, f, indent=4)
    print(f"Saved class indices to {MODELS_DIR / 'class_indices.json'}")

    # Performance Optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Data Augmentation
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.2),
        tf.keras.layers.RandomZoom(0.2),
    ])

    # Base Model (MobileNetV2)
    print("Building model...")
    base_model = MobileNetV2(input_shape=IMG_SIZE + (3,),
                             include_top=False,
                             weights='imagenet')
    
    base_model.trainable = False # Freeze base model initially

    # Custom Head
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.2)(x)
    outputs = Dense(len(class_names), activation='softmax')(x)
    
    model = Model(inputs, outputs)

    model.compile(optimizer=Adam(learning_rate=LEARNING_RATE),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    model.summary()

    # Callbacks
    callbacks = [
        ModelCheckpoint(
            filepath=str(MODELS_DIR / "plant_disease_model.keras"),
            save_best_only=True,
            monitor='val_accuracy',
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        )
    ]

    # Training
    print("Starting training...")
    history = model.fit(
        train_ds,
        epochs=5,
        validation_data=val_ds,
        callbacks=callbacks
    )
    
    print("Training finished.")
    
    # Optional: Fine-tuning (Unfreeze some layers)
    # base_model.trainable = True
    # ... recompile and fit with lower LR ...

if __name__ == "__main__":
    train_model()
