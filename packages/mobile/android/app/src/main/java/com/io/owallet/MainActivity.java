package com.io.owallet;

import com.reactnativenavigation.NavigationActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import org.devio.rn.splashscreen.SplashScreen; // here
import android.os.Bundle;
import io.branch.rnbranch.*;
import android.content.Intent;

public class MainActivity extends NavigationActivity {

  

  
  @Override
  protected void onStart() {
    super.onStart();
    RNBranchModule.initSession(getIntent().getData(), this);
  }  
  
  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    RNBranchModule.onNewIntent(intent);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this); 
    // super.onCreate(savedInstanceState);
    // Set onCreate(null) to fix this https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-425179033
    super.onCreate(null);
  }
}
