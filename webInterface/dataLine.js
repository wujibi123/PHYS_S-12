class dataLine {
	// For a single animated data line.
	constructor(x, y1, y2, minData, maxData, strokeWeight, frames, caption, color) {
		// x, beginning y coord, end y coord, stroke weight, frames = number of frames needed for data to slide
		this.dataX = x;
		this.dataBeginY = y1;
		this.dataEndY = y2;
		this.dataDistance = abs(y1 - y2);
		this.dataStrokeWeight = strokeWeight;
		this.frames = frames;
		this.currentY = y1;
		this.rawData = 0;
		this.processedData = 0; // the "goal" that currentY is always trying to reach
		this.minData = minData;
		this.maxData = maxData;
		this.dataRange = abs(maxData - minData);
		this.caption = caption;
		this.color = color;
	}

	update(rawData) {
		this.rawData = round(rawData, 2);
		if (this.minData < 0) {
			rawData += abs(this.minData);
		} else if (this.minData > 0) {
			rawData -= this.minData;
		}
		this.processedData = this.dataBeginY - (rawData/this.dataRange) * this.dataDistance;
		var rateOfChange = abs(this.processedData - this.currentY)/this.frames;
		if (this.currentY < this.processedData) {
			this.currentY += rateOfChange;
		} else if (this.currentY > this.processedData) {
			this.currentY -= rateOfChange;
		}
	}

	show() {
		stroke(this.color);
		strokeWeight(this.dataStrokeWeight);
		line(this.dataX, this.dataBeginY, this.dataX, this.currentY);

		// Drawing the Outline of the Data
		stroke(0);
		strokeWeight(5);

		line(this.dataX - this.dataStrokeWeight/2, this.dataBeginY, this.dataX - this.dataStrokeWeight/2, this.dataEndY);
		line(this.dataX + this.dataStrokeWeight/2, this.dataBeginY, this.dataX + this.dataStrokeWeight/2, this.dataEndY);
		noFill();
		arc(this.dataX, this.dataBeginY, this.dataStrokeWeight, this.dataStrokeWeight, 0, 180);
		arc(this.dataX, this.dataEndY, this.dataStrokeWeight, this.dataStrokeWeight, 180, 0);

		// Writing down temperature in text
		noStroke();
		fill(0);
		textSize(displayWidth/80);
		text(this.rawData, this.dataX, this.currentY - this.dataStrokeWeight);
		text(this.caption, this.dataX , this.dataBeginY + this.dataStrokeWeight);
	}
}