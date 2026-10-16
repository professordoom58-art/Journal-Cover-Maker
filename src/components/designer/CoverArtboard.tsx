import React, { useRef, useEffect } from 'react';
import { CoverState } from '../../types/project';

interface CoverArtboardProps {
  cover: CoverState;
  showGuides?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onPhotoMouseDown?: (e: React.MouseEvent, zone: 'front' | 'back') => void;
  onDropPhoto?: (e: React.DragEvent, zone: 'front' | 'back') => void;
  isInteractive?: boolean;
  scale?: number;
}

export const CoverArtboard: React.FC<CoverArtboardProps> = ({
  cover,
  showGuides = false,
  selectedElementId,
  onSelectElement,
  onPhotoMouseDown,
  onDropPhoto,
  isInteractive = true,
  scale = 1,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Diagnostic logging of artboard wrapper dimensions
  useEffect(() => {
    if (wrapperRef.current) {
      console.log('[Artboard Wrapper]', {
        width: wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight,
        scale,
      });
    }
  }, [scale]);

  const spineText = (cover.spine.text || '').slice(0, 24);

  // Back info box height & position
  const infoBlock = cover.infoBlock;
  const isDescriptionVisible = infoBlock.showDescription !== false && infoBlock.description.visible;
  const infoBoxHeight = isDescriptionVisible ? 150 : 76;
  // Trim bottom is y=540. Safe margin is 24px in => y=516.
  const infoBoxY = 516 - infoBoxHeight;
  const infoBoxX = 36; // 12px bleed + 24px safe margin
  const infoBoxWidth = 336; // 384 - 48

  // Photos configuration
  const backPhoto = cover.backPhoto;
  const frontPhoto = cover.frontPhoto;

  const backExtendBleed = backPhoto.extendBleed !== false;
  const frontExtendBleed = frontPhoto.extendBleed !== false;

  return (
    <div
      ref={wrapperRef}
      className="relative select-none"
      style={{
        width: '816px',
        minWidth: '816px',
        maxWidth: '816px',
        height: '552px',
        minHeight: '552px',
        maxHeight: '552px',
        flex: 'none',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
      onClick={() => isInteractive && onSelectElement && onSelectElement(null)}
    >
      {/* =================================================================== */}
      {/* 1. BACKGROUND LAYERS (Extend into outer bleed if enabled)            */}
      {/* =================================================================== */}

      {/* Back Panel Background Color */}
      <div
        className="absolute"
        style={{
          left: backExtendBleed ? '0px' : '12px',
          top: backExtendBleed ? '0px' : '12px',
          width: backExtendBleed ? '396px' : '384px',
          height: backExtendBleed ? '552px' : '528px',
          backgroundColor: backPhoto.backgroundColor || '#ffffff',
        }}
      />

      {/* Front Panel Background Color */}
      <div
        className="absolute"
        style={{
          left: '420px',
          top: frontExtendBleed ? '0px' : '12px',
          width: frontExtendBleed ? '396px' : '384px',
          height: frontExtendBleed ? '552px' : '528px',
          backgroundColor: frontPhoto.backgroundColor || '#ffffff',
        }}
      />

      {/* =================================================================== */}
      {/* 2. SPINE STRIP: x: 396 to 420 px (width 24px), full height with bleed */}
      {/* Default color: #2B2B33. Default text: #ffffff                        */}
      {/* =================================================================== */}
      {cover.spine.visible && (
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{
            left: '396px',
            top: '0px',
            width: '24px',
            height: '552px',
            backgroundColor: cover.spine.backgroundColor || '#2B2B33',
            cursor: isInteractive ? 'pointer' : 'default',
            zIndex: 10,
          }}
          onClick={(e) => {
            if (isInteractive) {
              e.stopPropagation();
              onSelectElement && onSelectElement('spine');
            }
          }}
        >
          {spineText && (
            <div
              style={{
                transform: 'rotate(90deg)',
                transformOrigin: 'center center',
                fontFamily: `"${cover.spine.fontFamily || 'Inter'}", sans-serif`,
                fontSize: `${cover.spine.fontSize || 11}pt`,
                color: cover.spine.textColor || '#ffffff',
                fontWeight: 600,
                letterSpacing: `${cover.spine.letterSpacing || 2}px`,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >
              {spineText}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. PHOTO ZONES: Stay strictly inside their 384 x 528 panels         */}
      {/* Default = FIT (object-fit: contain), never cropped by default       */}
      {/* =================================================================== */}

      {/* --- BACK PHOTO PANEL (x: 12 to 396, y: 12 to 540, w: 384, h: 528) --- */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: '12px',
          top: '12px',
          width: '384px',
          height: '528px',
          cursor: isInteractive ? 'move' : 'default',
          zIndex: 5,
        }}
        onMouseDown={(e) => isInteractive && onPhotoMouseDown && onPhotoMouseDown(e, 'back')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => isInteractive && onDropPhoto && onDropPhoto(e, 'back')}
      >
        {backPhoto.imageSrc ? (
          <img
            src={backPhoto.imageSrc}
            alt="Back cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: backPhoto.fitMode === 'fill' ? 'cover' : 'contain',
              display: 'block',
              transform: `translate(${backPhoto.panX}px, ${backPhoto.panY}px) scale(${backPhoto.zoom}) rotate(${backPhoto.rotation}deg) scale(${backPhoto.flipH ? -1 : 1}, ${backPhoto.flipV ? -1 : 1})`,
              transformOrigin: 'center center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : isInteractive ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 border border-dashed border-stone-300 rounded-lg">
            <span className="text-xs font-medium">Tap to add photo</span>
          </div>
        ) : null}
      </div>

      {/* --- FRONT PHOTO PANEL (x: 420 to 804, y: 12 to 540, w: 384, h: 528) --- */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: '420px',
          top: '12px',
          width: '384px',
          height: '528px',
          cursor: isInteractive ? 'move' : 'default',
          zIndex: 5,
        }}
        onMouseDown={(e) => isInteractive && onPhotoMouseDown && onPhotoMouseDown(e, 'front')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => isInteractive && onDropPhoto && onDropPhoto(e, 'front')}
      >
        {frontPhoto.imageSrc ? (
          <img
            src={frontPhoto.imageSrc}
            alt="Front cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: frontPhoto.fitMode === 'fill' ? 'cover' : 'contain',
              display: 'block',
              transform: `translate(${frontPhoto.panX}px, ${frontPhoto.panY}px) scale(${frontPhoto.zoom}) rotate(${frontPhoto.rotation}deg) scale(${frontPhoto.flipH ? -1 : 1}, ${frontPhoto.flipV ? -1 : 1})`,
              transformOrigin: 'center center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : isInteractive ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 border border-dashed border-stone-300 rounded-lg">
            <span className="text-xs font-medium">Tap to add photo</span>
          </div>
        ) : null}
      </div>

      {/* =================================================================== */}
      {/* 4. OVERLAYS: Back Info Box & Front Title (Always on top of photos)   */}
      {/* =================================================================== */}

      {/* Back Info Box */}
      {infoBlock.visible && (
        <div
          className={`absolute rounded-lg transition-shadow ${
            isInteractive && selectedElementId === 'info-block'
              ? 'ring-2 ring-terracotta-500 shadow-md'
              : 'shadow-xs'
          }`}
          style={{
            left: `${infoBoxX}px`,
            top: `${infoBoxY}px`,
            width: `${infoBoxWidth}px`,
            height: `${infoBoxHeight}px`,
            backgroundColor: infoBlock.backgroundColor,
            opacity: infoBlock.opacity,
            borderRadius: `${infoBlock.borderRadius}px`,
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: isInteractive ? 'pointer' : 'default',
            border: '1px solid rgba(0,0,0,0.06)',
            zIndex: 15,
          }}
          onClick={(e) => {
            if (isInteractive) {
              e.stopPropagation();
              onSelectElement && onSelectElement('info-block');
            }
          }}
        >
          {/* Description Text + Divider */}
          {isDescriptionVisible && (
            <div className="border-b border-stone-200/80 pb-2">
              <p
                style={{
                  fontFamily: `"${infoBlock.description.fontFamily || 'Inter'}", sans-serif`,
                  fontSize: `${infoBlock.description.fontSize || 9}pt`,
                  color: infoBlock.description.color,
                  lineHeight: infoBlock.description.lineHeight || 1.4,
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {infoBlock.description.text}
              </p>
            </div>
          )}

          {/* Details line */}
          {infoBlock.details.visible && infoBlock.details.text && (
            <p
              style={{
                fontFamily: `"${infoBlock.details.fontFamily || 'Inter'}", sans-serif`,
                fontSize: `${infoBlock.details.fontSize || 8}pt`,
                color: infoBlock.details.color,
                margin: 0,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {infoBlock.details.text}
            </p>
          )}

          {/* Bottom Row: Price Box & Barcode */}
          <div className="flex items-center justify-between pt-1">
            {/* Price Box */}
            {infoBlock.priceBox.visible && infoBlock.priceBox.text && (
              <div
                style={{
                  backgroundColor: infoBlock.priceBox.fillColor,
                  color: infoBlock.priceBox.textColor,
                  fontFamily: `"${infoBlock.priceBox.fontFamily || 'Inter'}", sans-serif`,
                  fontSize: `${infoBlock.priceBox.fontSize || 10}pt`,
                  fontWeight: 700,
                  borderRadius: `${infoBlock.priceBox.borderRadius}px`,
                  padding: '3px 10px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {infoBlock.priceBox.text}
              </div>
            )}

            {/* Barcode */}
            {infoBlock.barcode.visible && (
              <div className="flex flex-col items-center">
                <svg width="76" height="24" viewBox="0 0 76 24" className="block">
                  <rect width="76" height="24" fill="#ffffff" />
                  {[
                    2, 5, 7, 10, 11, 14, 18, 20, 22, 25, 27, 28, 31, 35, 37, 39, 42, 45, 47, 48,
                    51, 54, 56, 59, 62, 64, 66, 69, 72,
                  ].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="2"
                      width={i % 3 === 0 ? 2 : 1}
                      height="16"
                      fill="#0f172a"
                    />
                  ))}
                  <text
                    x="38"
                    y="22"
                    textAnchor="middle"
                    fontSize="5"
                    fontFamily="monospace"
                    fill="#0f172a"
                  >
                    {infoBlock.barcode.code || '9781402894626'}
                  </text>
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Front Title */}
      {cover.frontTitle.visible && cover.frontTitle.text && (
        <div
          className={`absolute flex items-center justify-center transition-all ${
            isInteractive && selectedElementId === 'front-title'
              ? 'ring-2 ring-terracotta-500 rounded-lg p-2 bg-terracotta-500/5'
              : ''
          }`}
          style={{
            left: '420px',
            top: `${12 + (cover.frontTitle.y || 200) - 40}px`,
            width: '384px',
            height: '80px',
            cursor: isInteractive ? 'pointer' : 'default',
            boxSizing: 'border-box',
            zIndex: 15,
          }}
          onClick={(e) => {
            if (isInteractive) {
              e.stopPropagation();
              onSelectElement && onSelectElement('front-title');
            }
          }}
        >
          <h1
            style={{
              fontFamily: `"${cover.frontTitle.fontFamily || 'Playfair Display'}", serif`,
              fontSize: `${cover.frontTitle.fontSize || 28}pt`,
              fontWeight: cover.frontTitle.fontWeight || 700,
              color: cover.frontTitle.textColor || '#0f172a',
              letterSpacing: `${cover.frontTitle.letterSpacing || 2}px`,
              textAlign: cover.frontTitle.align || 'center',
              lineHeight: 1.15,
              margin: 0,
              padding: '0 24px',
              maxWidth: '384px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cover.frontTitle.text}
          </h1>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. SVG GUIDES OVERLAY (Vector-effect non-scaling-stroke, 1.5px)      */}
      {/* =================================================================== */}
      {showGuides && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width="816"
          height="552"
          viewBox="0 0 816 552"
          style={{ zIndex: 30 }}
        >
          {/* Bleed = Red dashed (Outer border at 0.75, 0.75 to 814.5, 550.5) */}
          <rect
            x="0.75"
            y="0.75"
            width="814.5"
            height="550.5"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Trim = Black solid (792 x 528 at 12, 12) */}
          <rect
            x="12"
            y="12"
            width="792"
            height="528"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Safe Area = Green dashed (24px inside trim: 36, 36 to 744, 480) */}
          <rect
            x="36"
            y="36"
            width="744"
            height="480"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Spine Fold Lines = Gray dashed (x=396 and x=420 from y=12 to y=540) */}
          <line
            x1="396"
            y1="12"
            x2="396"
            y2="540"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="420"
            y1="12"
            x2="420"
            y2="540"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
};
