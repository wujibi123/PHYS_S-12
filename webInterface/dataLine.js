class dataLine {
	// For a single animated data line.
	constructor(x, y1, y2, minData, maxData, strokeWeight, frames) {
		// x, beginning y coord, end y coord, stroke weight, frames = number of frames needed for data to slide
		this.dataX = x;
		this.dataBeginY = y1;
		this.dataEndY = y2;
		this.dataDistance = abs(y1 - y2);
		this.dataStrokeWeight = strokeWeight;
		this.frames = frames;
		this.currentY = 0;
		this.newData = 0;
		this.minData = minData;
		this.maxData = maxData;
		this.dataRange = abs(maxData - minData);
	}

	update(rawData) {
		this.newData = round(rawData, 2);
		if (this.minData < 0) {
			rawData += abs(this.minData);
		}
		this.currentY = this.dataBeginY - (rawData/this.dataRange) * this.dataDistance;
		rateOfChange = abs(rawData - this.currentY)/this.frames;
		if (this.currentY < rawData) {
			this.currentY += rateOfChange;
		} else if (this.currentY > rawData) {
			this.currentY -= rateOfChange;
		}
	}

	show() {
		stroke('#ff5d00');
		strokeWeight(this.dataStrokeWeight);
		line(this.dataX, this.dataBeginY, this.dataX, this.currentY);

		// Drawing the Outline of the Data
		stroke(0);
		strokeWeight(5);

		line(this.dataX - this.dataStrokeWeight/2, this.dataBeginY, this.dataX - this.dataStrokeWeight/2, this.dataEndY);
		line(this.dataX + this.dataStrokeWeight/2, this.dataBeginY, this.dataX + this.dataStrokeWeight/2, this.dataEndY);
		noFill();
		arc(this.dataX, this.dataBeginY, this.dataStrokeWeight, this.dataStrokeWeight, 0, PI);
		arc(this.dataX, this.dataEndY, this.dataStrokeWeight, this.dataStrokeWeight, PI, 0);

		// Writing down temperature in text
		noStroke();
		fill(0);
		text(this.newData, this.dataX, this.currentY - this.dataStrokeWeight);
		text("Temperature (C)",this.dataX , this.dataBeginY + this.dataStrokeWeight);
	}
}