/*
MIT License

Copyright (c) 2021 Ryan Radford (werkn.io)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import {IInputs, IOutputs} from "./generated/ManifestTypes";
import 'qrcode-svg';

export class QRCodeGenerator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	//rendered elements
	private qrCode: HTMLImageElement;
	private generateButton: HTMLButtonElement;

	//properties on the component (we currenlty have none outside our input)
	private _userGuid: String;

	//local variables pulled from init, I like to think of these in terms of dependency injection
	//hence _XX names
	private isCodeGenerated: boolean = false;
	private _notifyOutputChanged: () => void;
	private _container: HTMLDivElement;
	private _context: ComponentFramework.Context<IInputs>;

	//component event handlers (here were capturing a Gengerate button press)
	private _generateClickHandler: EventListenerOrEventListenerObject;

	//required empty constructor
	constructor()
	{

	}

	private generateQRCode () {

			//import qrcode-svg from NPM package
			let QRCode = require('qrcode-svg');
			let svg = new QRCode(this._userGuid).svg();
			let svgElem = document.getElementById("svg-container");
			
			//null check
			if (svgElem) {
				svgElem.innerHTML = svg;
			}
	}

	public generateClickedHandler () {
		console.log("Generating QR code....");
		
		this.isCodeGenerated = true;
		
		//disable the button
		this.generateButton.disabled = true;

		this.generateQRCode();		
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
	{

		//we grab user guid in the generate (prob not best practice)

		//pull in auto-inited, dependency injected stuff
		this._context = context;
		this._container = container;
		this._notifyOutputChanged = notifyOutputChanged;
		this._generateClickHandler = this.generateClickedHandler.bind(this);
		
		//create a button on the control
		this.generateButton = document.createElement("button");
		this.generateButton.textContent = "Generate QR Code";
		this.generateButton.addEventListener("click", this._generateClickHandler);

		//create a div for the SVG
		let svgDiv = document.createElement("div");
		svgDiv.id = "svg-container";
		container.appendChild(svgDiv);
		container.appendChild(this.generateButton);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Checks for updates coming in from outside
		this._userGuid = this._context.parameters.userGuid.raw!;
	}

	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Remove the event listener we created in init
		this._container.querySelector("button")!.removeEventListener("click", this._generateClickHandler);
	}
}
