# CoronaVirus Modeler Updates / News
*Nurul Choudhury* <br>



## Update 2020-02-05

As new data arrives I have been updating the model parameters (the actual model is unchanged).

## Official Count

*2020-02-04*  **24641**

It seems that affect of the lockdown is significantly weaker that previously seen as we get new data. Originall it appeared that the lockdown 
had reduced the rate of spread of the virus by 98% (0.98 values  for *spreadReduction*). But as per the latest infection data published by China CDC, 
the lockdown reduction rate had to be revised down to 90%.  The method for determining the best fit is to look at the error value and adjust parameters until that value is minimized. 
![error in fit](Fit_error.PNG)

The other thing to consider is the slope of the officil data  and the simulation data. The slopes should closely match.

![slope comparison](official_model.png)

This optimization currently has to be done manually adjusting the sliders. In the newr future I am hoping to add a button to do this optimization automatically.
The standard method for doing this is called gradient descent, a technique employed by neural networks to optimize its the network weights (parameters).
