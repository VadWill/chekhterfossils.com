
import React from 'react';
import { 
  Clock, 
  Layers, 
  Bone, 
  Activity, 
  Dna, 
  Component, 
  PawPrint, 
  Trees, 
  CircleDashed 
} from 'lucide-react';

interface IconProps {
  type: string;
  className?: string;
}

export const DinoIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    viewBox="0 0 512 512" 
    className={`fill-current ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Tyrannosaurus Rex"
  >
    {/* Exact Tyrannosaurus Rex Running Silhouette from user image (centered & scaled) */}
    <path fillRule="evenodd" d="M 78.9 290.4 C 94 285 115.6 274.2 139 259.8 C 162.4 245.4 187.6 225.6 209.2 205.8 C 227.2 187.8 243.4 169.8 259.6 153.6 C 275.8 139.2 293.8 128.4 313.6 119.4 C 326.2 114 340.6 108.6 353.2 101.4 C 362.2 96 373 92.4 383.8 92.4 C 394.6 92.4 405.4 96 414.4 102.1 C 423.4 108.6 430.6 115.8 434.2 123.7 C 436 128.4 435.3 133.1 431.7 136.7 C 427 140.3 419.8 142.4 412.6 142.8 L 415.1 138.8 L 410.8 139.9 L 407.9 135.9 L 405 138.1 L 400.7 135.2 L 397.8 138.1 C 392.8 138.8 387.4 139.5 382.7 142.4 C 378.4 146 377 150 379.1 153.9 C 381.3 157.5 386.3 159 393.5 157.5 L 391.4 153.6 L 395.7 155.4 L 398.6 151.8 L 401.8 154.7 L 405.8 151.1 L 409.4 154.7 C 416.2 155.4 424.5 157.2 428.8 159.7 C 431 161.9 431 165.5 428.1 168 C 424.5 170.5 418 171.6 411.5 171.2 C 400 170.5 389.2 169.1 379.1 167.6 C 368.3 166.2 357.5 168 350.3 173.4 C 341.7 179.9 335.2 189.6 330.2 200.4 C 326.2 209.4 323 218.4 320.8 227.4 C 322.2 231 325.1 236.4 328.7 242.5 C 330.2 245.4 328.7 248.3 325.8 249 C 323 249.7 320.8 247.5 319.4 244.7 C 317.2 241.1 315.8 237.5 315 234.6 L 315.8 242.5 L 312.9 241.1 C 311.4 236.4 310 231 309.3 225.6 C 302.8 234.6 296.3 247.2 289.1 259.8 C 281.9 273.5 275.8 286.8 272.2 299.4 C 270.4 306.6 272.2 313.8 277.6 321 C 283 328.2 291.3 333.6 299.9 338.3 C 306.4 341.9 313.6 345.5 319 349.1 C 321.5 351.2 321.5 353.4 319 354.8 C 316.5 356.3 312.9 355.5 308.2 353.4 C 302.8 350.5 296.3 346.9 290.2 342.6 C 283 336.8 277.6 330.3 274.7 322.8 C 271.1 313.8 269 303 267.5 292.2 C 263.2 299.4 258.9 308.4 254.2 319.2 C 248.8 331.8 244.5 345.5 241.6 358.8 C 239.8 368.5 240.9 377.9 244.5 387.6 C 248.1 397.3 252.4 406.7 256.7 415.3 C 258.2 417.5 255.3 419.6 252.4 419.6 C 247 419.6 241.6 417.5 237.3 414.6 C 234.4 411.7 233 408.1 234.4 403.8 C 237.3 393 238.7 380.4 238.7 368.5 C 238 355.2 233 342.6 227.2 330 C 221.8 317.4 218.2 304.8 217.1 292.2 C 202 300.1 184.7 308.4 166.7 315.6 C 147.3 322.8 125.7 330 104.1 336.1 C 88.6 340.4 79.6 343.3 76 344 C 76.7 331.8 77.4 308.4 78.9 290.4 Z" />
  </svg>
);

export const TechIcon: React.FC<IconProps> = ({ type, className = "" }) => {
  const commonClasses = `stroke-[1.5px] ${className}`;

  switch (type) {
    case 'era':
      return <Clock className={commonClasses} />;
    case 'geology':
      return <Layers className={commonClasses} />;
    case 'discovery':
      return <Bone className={commonClasses} />;
    case 'status':
      return <Activity className={commonClasses} />;
    case 'skull':
    case 'footprint':
      return <DinoIcon className={`w-4 h-4 inline-block ${className}`} />;
    case 'skeleton':
      return <Component className={commonClasses} />;
    case 'environment':
      return <Trees className={commonClasses} />;
    default:
      return <CircleDashed className={commonClasses} />;
  }
};
